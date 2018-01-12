/*
 * Copyright yz 2017-12-12 Email:admin@javaweb.org.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.anbai.editor.api;

import com.alibaba.fastjson.JSONObject;
import com.anbai.editor.commons.ResultInfo;
import com.anbai.editor.entity.SysFile;
import com.anbai.editor.service.SysFileService;
import com.anbai.editor.utils.*;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/ab-editor/")
public class ABEditorAPI {

	private static final String TYPE = "^image|flash|media|file$";

	private static final String DISALLOW_SUFFIX_REG = "\\.(asp|asa|jsp|php|(a-zA-z)?htm|swf|fl(a|v)|xml|js|css)";

	private static long MAX_SIZE = 99999999;

	private static String classPath;

	private static File stickerDir;

	@Resource
	private SysFileService sysFileService;

	static {
		try {
			classPath = HttpServletRequestUtils.getClassPathResource("static");
			stickerDir = new File(classPath, "/plugins/ab-editor/images/sticker/");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 获取表情包分组列表信息
	 *
	 * @return
	 */
	public List<Map<String, Object>> getStickerGroupList() {
		List<Map<String, Object>> ls = new ArrayList();

		if (stickerDir != null && stickerDir.exists()) {
			try {
				File[] files = stickerDir.listFiles();

				for (File file : files) {
					File configFile = new File(file, "config.json");

					if (configFile != null && configFile.exists()) {
						String              str = FileUtils.readFileToString(configFile, "UTF-8");
						Map<String, Object> map = JSONObject.parseObject(str, Map.class);

						// 必须包含表情包分组名称和表情包名称
						if (map.containsKey("group_name") && map.containsKey("sticker_name")) {
							ls.add(map);
						}
					}
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		// 按照配置文件的order值大小排序
		ls.sort((map1, map2) -> {
			try {
				String o1 = String.valueOf(map1.get("order"));
				String o2 = String.valueOf(map2.get("order"));

				if (StringUtils.isNumeric(o1) && StringUtils.isNumeric(o2)) {
					int order1 = Integer.parseInt(o1);
					int order2 = Integer.parseInt(o2);

					return order1 > order2 ? 1 : -1;
				}

				return 0;
			} catch (Exception e) {
				return -1;
			}
		});

		return ls;
	}

	/**
	 * 获取表情包分组列表
	 *
	 * @param response
	 */
	@RequestMapping(value = "/sticker_group.php", method = {RequestMethod.GET, RequestMethod.POST})
	public void getStickerGroup(HttpServletResponse response) {
		HttpServletResponseUtils.responseJson(response, new ResultInfo(getStickerGroupList(), true));
	}

	/**
	 * 获取表情包下所有表情列表
	 *
	 * @param stickerName
	 * @param response
	 */
	@RequestMapping(value = "/sticker_list.php", method = {RequestMethod.GET, RequestMethod.POST})
	public void getStickerList(String stickerName, HttpServletResponse response) {
		List<Map<String, Object>> ls   = new ArrayList();
		ResultInfo                info = new ResultInfo();

		if (stickerName != null && stickerDir != null) {
			File stickerFile = new File(stickerDir, stickerName);
			File staticFile  = new File(stickerFile, "static");
			File gifDir      = new File(stickerFile, "gif");

			if (staticFile.exists() || gifDir.exists()) {
				File[] files = staticFile.exists() ? staticFile.listFiles() : gifDir.listFiles();

				for (File file : files) {
					Map<String, Object> fileMap = new LinkedHashMap();
					String              path    = file.getAbsolutePath().substring(classPath.length());

					if (staticFile.exists()) {
						File   gifFile = new File(gifDir, file.getName().replaceAll(".png$", ".gif"));
						String gifPath = gifFile.getAbsolutePath().substring(classPath.length());
						fileMap.put("gif_path", gifFile.exists() ? gifPath : "");
					} else {
						fileMap.put("gif_path", "");
					}

					fileMap.put("filename", file.getName());
					fileMap.put("path", path);
					ls.add(fileMap);
				}
			}
		} else {
			info.setMsg("无法读取表情包数据!");
		}

		info.setData(ls);

		HttpServletResponseUtils.responseJson(response, info);
	}

	/**
	 * 文件上传接口
	 *
	 * @param request
	 * @param response
	 * @throws IOException
	 * @throws FileUploadException
	 */
	@RequestMapping("/upload_json.php")
	public void uploadJson(HttpServletRequest request, HttpServletResponse response)
			throws IOException, FileUploadException {

		File   uploadDir = new File(HttpServletRequestUtils.getClassPathResource(), "/static/uploads/");
		String savePath  = uploadDir.getAbsolutePath() + "/";

		String saveUrl = "uploads/";

		if (!ServletFileUpload.isMultipartContent(request)) {
			HttpServletResponseUtils.responseText(response, getError("请选择文件!"));
			return;
		}

		if (!uploadDir.exists()) {
			uploadDir.mkdir();
		}

		String dirName = request.getParameter("dir");
		if (dirName == null) {
			dirName = "image";
		}

		if (!Pattern.compile(TYPE, Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(dirName).find()) {
			HttpServletResponseUtils.responseText(response, (getError("目录名不正确!")));
			return;
		}

		// 创建文件夹
		savePath += dirName + "/";
		saveUrl += dirName + "/";
		File saveDirFile = new File(savePath);

		if (!saveDirFile.exists()) {
			saveDirFile.mkdirs();
		}

		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		String           ymd = sdf.format(new Date());

		savePath += ymd + "/";
		saveUrl += ymd + "/";

		File dirFile = new File(savePath);
		if (!dirFile.exists()) {
			dirFile.mkdirs();
		}

		MultipartHttpServletRequest multiRequest = (MultipartHttpServletRequest) request;

		Iterator<String> itr = multiRequest.getFileNames();

		while (itr.hasNext()) {
			MultipartFile multipartFile = multiRequest.getFile(itr.next());

			if (multipartFile != null) {
				InputStream in       = multipartFile.getInputStream();
				String      fileName = multipartFile.getOriginalFilename();

				if (fileName.indexOf('\u0000') != -1) {
					HttpServletResponseUtils.responseText(response, getError("上传文件名非法!"));
					return;
				}

				if (in.available() > MAX_SIZE) {
					HttpServletResponseUtils.responseText(response, getError("上传文件大小超过限制!"));
					return;
				}

				String fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

				// 只过滤动态脚本,uploads目录应该设置为不解析的静态文件目录
				if (Pattern.compile(DISALLOW_SUFFIX_REG, Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(fileExt).find()) {
					HttpServletResponseUtils.responseText(response, getError("上传文件扩展名是不允许的扩展名!"));
					return;
				}

				SimpleDateFormat df           = new SimpleDateFormat("yyyyMMddHHmmss");
				String           newFileName  = df.format(new Date()) + "_" + new Random().nextInt(1000) + "." + fileExt;
				File             uploadedFile = new File(savePath, newFileName);

				try {
					multipartFile.transferTo(uploadedFile);
				} catch (Exception e) {
					HttpServletResponseUtils.responseText(response, getError("上传文件失败,服务器异常!"));
					return;
				}

				String              url = HttpServletRequestUtils.getWebBaseUrlPath(request) + saveUrl + newFileName;
				Map<String, Object> obj = new HashMap<String, Object>();

				try {
					// 只支持JPG、GIF、PNG、BMP、TIFF格式的图片
					ImageInfo info = ImageUtils.getImageInfo(uploadedFile);
					obj.put("isImage", info.getWidth() > 0 || info.getHeight() > 0);
					obj.put("width", info.getWidth());
					obj.put("height", info.getHeight());
				} catch (Exception e) {
					obj.put("isImage", false);
				}

				SysFile sysFile = new SysFile();

				sysFile.setUserId(0L);// 设置用户ID

				fileName = HttpServletRequestUtils.htmlSpecialChars(fileName);

				sysFile.setClientIp(HttpServletRequestUtils.getRemoteAddr(request));
				sysFile.setFilename(fileName);// 文件名
				sysFile.setFileUrl(url);// 文件URL访问地址
				sysFile.setFilePath(uploadedFile.getAbsolutePath());// 文件绝对路径
				sysFile.setDownloadQuantity(0L);
				sysFile.setUploadTime(new Date());

				SysFile uploadFile = sysFileService.addSysFile(sysFile);// 存储文件信息

				obj.put("error", 0);
				obj.put("url", request.getContextPath() + "/f/" + uploadFile.getFileId());
				obj.put("filename", fileName);
				obj.put("message", "文件上传成功!");

				HttpServletResponseUtils.responseJson(response, obj);
			} else {
				HttpServletResponseUtils.responseJson(response, getError("数据包格式错误!"));
			}
		}

	}

	/**
	 * 输出json格式化的错误信息
	 *
	 * @param message
	 * @return
	 */
	private String getError(String message) {
		Map<String, Object> obj = new HashMap<String, Object>();

		obj.put("error", 1);
		obj.put("message", message);

		return JSONObject.toJSONString(obj);
	}

}
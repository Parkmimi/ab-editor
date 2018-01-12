/*
 * Copyright yz 2017-12-21 Email:admin@javaweb.org.
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
package com.anbai.editor.controller;

import com.anbai.editor.entity.SysFile;
import com.anbai.editor.service.SysFileService;
import com.anbai.editor.utils.HttpServletResponseUtils;
import com.anbai.editor.utils.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.File;

@Controller
public class SysFileController {

	@Resource
	private SysFileService sysFileService;

	@RequestMapping(value = "/f/{fileId}", method = RequestMethod.GET)
	public void getFileById(@PathVariable(value = "fileId") Long fileId, HttpServletResponse response) {
		try {
			SysFile sysFile = sysFileService.findSysFileByFileId(fileId);

			if (sysFile != null && StringUtils.isNotEmpty(sysFile.getFilePath())) {
				File file = new File(sysFile.getFilePath());

				if (file.exists()) {
					HttpServletResponseUtils.download(response, file, sysFile.getFilename());
					return;
				}
			}

			HttpServletResponseUtils.responseText(response, "文件不存在!");
		} catch (Exception e) {
			HttpServletResponseUtils.responseText(response, "服务器异常!");
		}
	}

}

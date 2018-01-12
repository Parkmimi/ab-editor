package com.anbai.editor.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "sys_files")
public class SysFile implements Serializable {

	private static final long serialVersionUID = 5446859612121853407L;

	/**
	 * 文件ID
	 */
	@Id
	@GeneratedValue
	private Long fileId;

	/**
	 * 上传用户ID
	 */
	private Long userId;

	/**
	 * 客户端上传IP
	 */
	private String clientIp;

	/**
	 * 文件名
	 */
	private String filename;

	/**
	 * 图片URL地址
	 */
	private String fileUrl;

	/**
	 * 图片绝对路径
	 */
	private String filePath;

	/**
	 * 上传时间
	 */
	private Date uploadTime;

	/**
	 * 下载量
	 */
	private Long downloadQuantity;

	/**
	 * 获取文件ID
	 *
	 * @return
	 */
	public Long getFileId() {
		return this.fileId;
	}

	/**
	 * 设置文件ID
	 *
	 * @param fileId
	 */
	public void setFileId(Long fileId) {
		this.fileId = fileId;
	}

	/**
	 * 获取上传用户ID
	 *
	 * @return
	 */
	public Long getUserId() {
		return this.userId;
	}

	/**
	 * 设置上传用户ID
	 *
	 * @param userId
	 */
	public void setUserId(Long userId) {
		this.userId = userId;
	}

	/**
	 * 获取客户端上传IP
	 *
	 * @return
	 */
	public String getClientIp() {
		return this.clientIp;
	}

	/**
	 * 设置客户端上传IP
	 *
	 * @param clientIp
	 */
	public void setClientIp(String clientIp) {
		this.clientIp = clientIp;
	}

	/**
	 * 获取文件名
	 *
	 * @return
	 */
	public String getFilename() {
		return filename;
	}

	/**
	 * 设置文件名
	 *
	 * @param filename
	 */
	public void setFilename(String filename) {
		this.filename = filename;
	}

	/**
	 * 获取图片地址
	 *
	 * @return
	 */
	public String getFileUrl() {
		return this.fileUrl;
	}

	/**
	 * 设置图片地址
	 *
	 * @param fileUrl
	 */
	public void setFileUrl(String fileUrl) {
		this.fileUrl = fileUrl;
	}

	/**
	 * 获取图片绝对路径
	 *
	 * @return
	 */
	public String getFilePath() {
		return filePath;
	}

	/**
	 * 设置图片绝对路径
	 *
	 * @param filePath
	 */
	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}

	/**
	 * 获取上传时间
	 *
	 * @return
	 */
	public Date getUploadTime() {
		return this.uploadTime;
	}

	/**
	 * 设置上传时间
	 *
	 * @param uploadTime
	 */
	public void setUploadTime(Date uploadTime) {
		this.uploadTime = uploadTime;
	}

	/**
	 * 获取下载量
	 *
	 * @return
	 */
	public Long getDownloadQuantity() {
		return this.downloadQuantity;
	}

	/**
	 * 设置下载量
	 *
	 * @param downloadQuantity
	 */
	public void setDownloadQuantity(Long downloadQuantity) {
		this.downloadQuantity = downloadQuantity;
	}

}

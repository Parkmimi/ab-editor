package com.anbai.editor.utils;

import java.io.Serializable;

/**
 * Created by yz on 2016/12/3.
 */
public class MultipartFile implements Serializable {

	/**
	 * 原始文件名称
	 */
	private String originalFilename;

	/**
	 * 上传成功后的新文件名
	 */
	private String filename;

	/**
	 * 文件大小
	 */
	private long size;

	/**
	 * 本地存储的文件绝对路径
	 */
	private String path;

	/**
	 * URL绝对路径
	 */
	private String url;

	public String getOriginalFilename() {
		return originalFilename;
	}

	public void setOriginalFilename(String originalFilename) {
		this.originalFilename = originalFilename;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public long getSize() {
		return size;
	}

	public void setSize(long size) {
		this.size = size;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

}
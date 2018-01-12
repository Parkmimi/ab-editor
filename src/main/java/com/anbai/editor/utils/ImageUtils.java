package com.anbai.editor.utils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * 简单的图片处理工具类,只支持JPG、GIF、PNG、BMP、TIFF格式的图片
 */
public class ImageUtils {

	/**
	 * 获取图片基本信息
	 *
	 * @param file
	 * @return
	 * @throws IOException
	 */
	public static ImageInfo getImageInfo(File file) throws IOException {
		return new ImageInfo(file);
	}

	/**
	 * 获取图片基本信息
	 *
	 * @param bytes
	 * @return
	 * @throws IOException
	 */
	public static ImageInfo getImageInfo(byte[] bytes) throws IOException {
		return new ImageInfo(bytes);
	}

	/**
	 * 获取图片基本信息
	 *
	 * @param in
	 * @return
	 * @throws IOException
	 */
	public static ImageInfo getImageInfo(InputStream in) throws IOException {
		return new ImageInfo(in);
	}

	/**
	 * 判断是否是图片
	 *
	 * @param file
	 * @return
	 * @throws IOException
	 */
	public static boolean isImage(File file) throws IOException {
		try {
			ImageInfo info = new ImageInfo(file);
			return info.getWidth() > 0 || info.getHeight() > 0;
		} catch (IOException e) {
			return false;
		}
	}

	/**
	 * 判断是否是图片
	 *
	 * @param bytes
	 * @return
	 * @throws IOException
	 */
	public static boolean isImage(byte[] bytes) throws IOException {
		try {
			ImageInfo info = new ImageInfo(bytes);
			return info.getWidth() > 0 || info.getHeight() > 0;
		} catch (IOException e) {
			return false;
		}
	}

	/**
	 * 判断是否是图片
	 *
	 * @param in
	 * @return
	 * @throws IOException
	 */
	public static boolean isImage(InputStream in) throws IOException {
		try {
			ImageInfo info = new ImageInfo(in);
			return info.getWidth() > 0 || info.getHeight() > 0;
		} catch (IOException e) {
			return false;
		}
	}

}
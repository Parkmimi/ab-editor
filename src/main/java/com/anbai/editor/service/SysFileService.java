package com.anbai.editor.service;

import com.anbai.editor.entity.SysFile;

public interface SysFileService {

	SysFile findSysFileByFileId(Long fileId) throws Exception;

	SysFile addSysFile(SysFile file);

}
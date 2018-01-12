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
package com.anbai.editor.service.impl;

import com.anbai.editor.entity.SysFile;
import com.anbai.editor.repository.SysFileRepository;
import com.anbai.editor.service.SysFileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;

@Service
public class SysFileServiceImpl implements SysFileService {

	@Resource
	private SysFileRepository sysFileRepository;

	@Override
	@Transactional
	public SysFile findSysFileByFileId(Long fileId) throws Exception {
		try {
			SysFile sysFile = sysFileRepository.findSysFileByFileId(fileId);

			if (sysFile != null) {
				sysFileRepository.updateDownloadQuantityByFileId(fileId);
			}

			return sysFile;
		} catch (Exception e) {
			throw e;
		}
	}

	@Override
	public SysFile addSysFile(SysFile file) {
		return sysFileRepository.save(file);
	}

}

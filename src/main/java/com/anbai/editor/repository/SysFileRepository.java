package com.anbai.editor.repository;

import com.anbai.editor.entity.SysFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SysFileRepository extends JpaRepository<SysFile, Long>, PagingAndSortingRepository<SysFile, Long>, JpaSpecificationExecutor<SysFile> {

	SysFile findSysFileByFileId(Long fileId);

	@Modifying
	@Query("update SysFile set downloadQuantity = downloadQuantity+1 where fileId = ?1 ")
	int updateDownloadQuantityByFileId(Long fileId);

}
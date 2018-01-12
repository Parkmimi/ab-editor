package com.anbai.editor.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.anbai.*"})
public class AbEditorApplication {

	public static void main(String[] args) {
		SpringApplication.run(AbEditorApplication.class, args);
	}

}
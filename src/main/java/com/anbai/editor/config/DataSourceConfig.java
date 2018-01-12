package com.anbai.editor.config;

import com.alibaba.druid.pool.DruidDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.SQLException;

/**
 * Druid 数据源配置,JDBC 中的连接数据库的密码需要用此类中的passwordGenerator生成后才能使用
 *
 * @author yz
 */
@Configuration
public class DataSourceConfig {

	@Autowired
	private Environment environment;

	@Bean(name = "dataSource", initMethod = "init", destroyMethod = "close")
	public DataSource dataSource() {
		DruidDataSource         datasource = new DruidDataSource();
		RelaxedPropertyResolver config     = new RelaxedPropertyResolver(environment, "spring.datasource.");

		datasource.setUrl(config.getProperty("url"));
		datasource.setUsername(config.getProperty("username"));
		datasource.setPassword(config.getProperty("password"));
		datasource.setDriverClassName(config.getProperty("driverClassName"));
		datasource.setInitialSize(Integer.parseInt(config.getProperty("initialSize")));
		datasource.setMinIdle(Integer.parseInt(config.getProperty("minIdle")));
		datasource.setMaxActive(Integer.parseInt(config.getProperty("maxActive")));
		datasource.setMaxWait(Long.parseLong(config.getProperty("maxWait")));
		datasource.setTimeBetweenEvictionRunsMillis(Long.parseLong(config.getProperty("timeBetweenEvictionRunsMillis")));
		datasource.setMinEvictableIdleTimeMillis(Long.parseLong(config.getProperty("minEvictableIdleTimeMillis")));
		datasource.setValidationQuery(config.getProperty("validationQuery"));
		datasource.setTestWhileIdle(Boolean.parseBoolean(config.getProperty("testWhileIdle")));
		datasource.setTestOnBorrow(Boolean.parseBoolean(config.getProperty("testOnBorrow")));
		datasource.setTestOnReturn(Boolean.parseBoolean(config.getProperty("testOnReturn")));
		datasource.setPoolPreparedStatements(Boolean.parseBoolean(config.getProperty("poolPreparedStatements")));

		try {
			datasource.setFilters(config.getProperty("filters"));
		} catch (SQLException e) {
			e.printStackTrace();
		}

		return datasource;
	}

	/**
	 * 只是为了消除IDEA无法识别Spring自动创建的jdbcTemplate的警告
	 *
	 * @param dataSource
	 * @return
	 */
	@Bean
	public JdbcTemplate jdbcTemplate(DataSource dataSource) {
		return new JdbcTemplate(dataSource);
	}

}
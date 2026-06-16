# MyBlog - 个人博客系统

基于 Spring Boot 3.2 构建的个人博客网站，集成自动新闻爬取功能。由原始 Node.js + Express 项目重构而来。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | Spring Boot 3.2.5 |
| ORM | Spring Data JPA + Hibernate 6 |
| 数据库 | SQLite 3（通过 sqlite-jdbc 3.45.1.0） |
| 网页爬虫 | Jsoup 1.17.2 |
| 定时任务 | Spring @Scheduled |
| 前端 | HTML + Tailwind CSS + JavaScript |
| 构建工具 | Maven |
| JDK | Java 17+ |

## 项目结构

```
MyBlog/
├── pom.xml                                    # Maven 配置
├── blog.db                                    # SQLite 数据库文件
├── src/main/java/com/myblog/
│   ├── MyBlogApplication.java                 # 启动类
│   ├── config/
│   │   ├── EncodingFilter.java                # 全局 UTF-8 编码过滤器
│   │   ├── StartupRunner.java                 # 启动时打印信息 + 首次爬取
│   │   └── WebConfig.java                     # CORS、静态资源、缓存配置
│   ├── entity/
│   │   ├── Post.java                          # 文章实体
│   │   └── News.java                          # 新闻实体
│   ├── repository/
│   │   ├── PostRepository.java                # 文章数据访问层
│   │   └── NewsRepository.java                # 新闻数据访问层
│   ├── service/
│   │   ├── PostService.java                   # 文章业务逻辑
│   │   ├── NewsService.java                   # 新闻业务逻辑
│   │   └── ScraperService.java                # 新闻爬虫（4个新闻源）
│   ├── controller/
│   │   ├── PostController.java                # /api/posts/* 接口
│   │   ├── NewsController.java                # /api/news/* 接口
│   │   ├── ScraperController.java             # /api/scrape/* 接口
│   │   └── AdminController.java               # /api/admin/* 接口
│   └── dto/
│       └── PageResponse.java                  # 分页响应 DTO
└── src/main/resources/
    ├── application.properties                 # 应用配置
    └── static/                                # 前端静态资源
        ├── index.html                         # 首页
        ├── post.html                          # 文章详情页
        ├── about.html                         # 关于页
        ├── news-list.html                     # 新闻列表页
        ├── news-detail.html                   # 新闻详情页
        ├── css/style.css                      # 样式表
        ├── js/main.js                         # 前端逻辑
        └── admin/
            ├── posts.html                     # 管理后台 - 文章列表
            └── edit.html                      # 管理后台 - 编辑文章
```

## 快速开始

### 环境要求

- JDK 17 或更高版本
- Maven 3.6+
- IntelliJ IDEA（推荐）

### 方式一：IDEA 运行（推荐）

1. 用 IntelliJ IDEA 打开项目目录
2. 等待 IDEA 自动识别 `pom.xml` 并导入 Maven 项目
3. 右键 `MyBlogApplication.java` → `Run`
4. 浏览器访问 http://localhost:8080

### 方式二：Maven 命令行

```bash
# 编译
mvn clean compile

# 运行
mvn spring-boot:run

# 打包为 JAR
mvn clean package -DskipTests

# 运行 JAR
java -jar target/myblog-1.0.0.jar
```

### 方式三：打包后独立运行

```bash
java -jar myblog-1.0.0.jar
```

## 功能特性

### 博客文章

- 文章的增删改查（CRUD）
- 按分类筛选文章
- 文章浏览量统计
- Markdown 内容渲染（前端 marked.js）
- 代码高亮（前端 highlight.js）
- 上一篇 / 下一篇导航
- 文章目录自动生成

### 新闻聚合

- 自动爬取 4 个新闻源：
  - 网易新闻（news.163.com）
  - 澎湃新闻（thepaper.cn）
  - 新华日报（xhby.net）
  - 红星新闻（hxnews.com）
- 智能分类检测（国内/国际/财经/科技/教育/健康/体育/娱乐/社会）
- 每 2 小时自动爬取（Spring @Scheduled）
- 支持手动触发爬取
- 按来源 / 分类筛选新闻

### 管理后台

- 简单 Token 认证（密码：`admin123`）
- 文章管理（列表 / 新建 / 编辑 / 删除）
- Markdown 实时预览编辑器

### 前端

- 响应式设计（Tailwind CSS）
- 骨架屏加载动画
- 头条新闻轮播
- 今日热点侧边栏
- 移动端适配

## 页面地址

| 页面 | 地址 |
|------|------|
| 首页 | http://localhost:8080 |
| 文章详情 | http://localhost:8080/post.html?id=1 |
| 新闻列表 | http://localhost:8080/news-list.html |
| 关于页 | http://localhost:8080/about.html |
| 管理后台 | http://localhost:8080/admin/posts.html |
| 文章编辑 | http://localhost:8080/admin/edit.html |

## API 接口

### 文章接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts?page=1&size=10` | 获取文章列表（分页） |
| GET | `/api/posts/{id}` | 获取文章详情 |
| GET | `/api/posts/category/{category}?page=1&size=20` | 按分类获取文章 |
| GET | `/api/posts/categories/list` | 获取所有分类 |
| POST | `/api/posts` | 创建文章 |
| PUT | `/api/posts/{id}` | 更新文章 |
| DELETE | `/api/posts/{id}` | 删除文章 |

### 新闻接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/news/latest?limit=10` | 获取最新新闻 |
| GET | `/api/news/hot?limit=5` | 获取头条新闻（带封面图） |
| GET | `/api/news/list?page=1&size=20` | 分页获取新闻列表 |
| GET | `/api/news/category/{category}?page=1&size=20` | 按分类获取新闻 |
| GET | `/api/news/source/{source}?page=1&size=20` | 按来源获取新闻 |
| GET | `/api/news/categories` | 获取新闻分类列表 |
| GET | `/api/news/sources` | 获取新闻来源列表 |
| GET | `/api/news/stats` | 获取新闻统计 |

### 爬虫接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/scrape` | 手动触发全量爬取 |
| GET | `/api/scrape/status` | 获取爬虫状态 |

### 管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 管理员登录 |
| GET | `/api/admin/check` | 验证登录状态 |

## 数据库

使用 SQLite 文件数据库，启动时自动创建表结构（`ddl-auto=update`）。

### 数据表

**posts（文章表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键自增 |
| title | TEXT | 标题 |
| content | TEXT | 内容（Markdown） |
| category | TEXT | 分类 |
| tags | TEXT | 标签（逗号分隔） |
| summary | TEXT | 摘要 |
| image_url | TEXT | 封面图 URL |
| publish_time | TEXT | 发布时间 |
| views | INTEGER | 浏览量 |
| created_at | TEXT | 创建时间 |

**news（新闻表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键自增 |
| title | TEXT | 标题 |
| url | TEXT | 原文链接（唯一） |
| source | TEXT | 来源 |
| category | TEXT | 分类 |
| summary | TEXT | 摘要 |
| image_url | TEXT | 封面图 URL |
| publish_time | TEXT | 发布时间 |
| created_at | TEXT | 创建时间 |

### IDEA 查看数据库

1. 右侧边栏 → Database
2. + → Data Source → SQLite
3. File path: `项目目录/blog.db`
4. Test Connection → OK

## 配置说明

`src/main/resources/application.properties`

```properties
# 服务端口
server.port=8080

# 全局 UTF-8 编码
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.force=true

# SQLite 数据库
spring.datasource.url=jdbc:sqlite:blog.db
spring.datasource.driver-class-name=org.sqlite.JDBC

# JPA 配置
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Jackson JSON 序列化
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
spring.jackson.time-zone=Asia/Shanghai
```

## 框架对照

本项目由原始 Node.js 项目重构而来，框架对应关系：

| 原框架（Node.js） | 新框架（Spring Boot） |
|-------------------|----------------------|
| Express 4 | Spring Boot 3.2 Web |
| sql.js（SQLite） | Spring Data JPA + Hibernate + sqlite-jdbc |
| cheerio（HTML 解析） | Jsoup |
| node-schedule（定时任务） | Spring @Scheduled |
| axios（HTTP 请求） | Jsoup.connect() |
| 原生 Token 验证 | Spring Controller |

## 常见问题

### Tomcat Native 报错

```
An incompatible version [1.2.23] of the Apache Tomcat Native library is installed
```

可忽略。Spring Boot 内嵌 Tomcat 会自动回退到纯 Java 实现，不影响功能。

### 页面乱码

确保所有文件使用 UTF-8 无 BOM 编码。项目已配置 `EncodingFilter` 和 `server.servlet.encoding.force=true` 强制 UTF-8。

### 数据库数据丢失

`blog.db` 文件存储在项目根目录。如需重置，删除该文件后重启应用，JPA 会自动重建表结构。

### 爬虫失败

爬虫依赖网络连接访问外部新闻网站。如网络受限，爬取会失败但不影响博客正常使用。可手动触发：

```bash
curl -X POST http://localhost:8080/api/scrape
```

## License

MIT

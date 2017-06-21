UMP

### 开发环境
1.先执行 npm run build

2.npm install -g supervisor

2.然后 npm run dev

### 生产环境
1.npm run build
2.修改build/config.master配置文件
3.nohup node build/server.js
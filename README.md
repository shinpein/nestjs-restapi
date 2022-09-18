# nest.js、jwt、prisma、postgresql(docker) で作るバックエンド

## 環境構築

### npm と nest、yarn のインストール

```bash
$ npm install
$ npm i -g @nestjs/cli
$ npm i -g yarn

$ nest new [projectName]
$ cd [projectName]
```

※/c/Users/PCUser/AppData/Local/Volta/bin/nest

### "tsconfig.json"の修正、追加

```json
{
  "compilerOptions": {
    ～略～
    "noImplicitAny": true, //修正
    "strict": true  //追加
  }
}
```

### "src/main.ts"のポート番号の変更

```js
// next.js が3000番ポートを使用するため変更
await app.listen(5000);
```

### 起動（監視モードで起動）

```bash
# 監視モード
$ yarn start:dev

# 開発用
$ yarn start

# 本番用
$ yarn start:prod

#localhost:5000 で「Hello World!」が表示されれば成功
```

### postgresql のインストールと起動（要 docker）

#### docker-compose.yml の作成

```docker
version: '3.8'
services:
  postgresql:
    image: postgres:14.4-alpine
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    restart: always
    networks:
      - backend
networks:
  backend:
```

#### postgresql の起動

```bash
$ docker-compose up -d
```

#### .env の DATABASE_URL の修正

```.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
```

### prisma のインストール

```bash
# prismaのインストール
$ yarn add -D prisma

# prisma-clientのインストール
$ yarn add @prisma/client

# prismaの各ファイルの設置
$ npx prisma init

```

#### prisma/schema.prisma の追加

1 対多（User < Post）のリレーションの表記に注意

```schema.prisma
model User {
  id Int @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  name String @db.VarChar(40)
  email String @unique @db.VarChar(100)
  hashedPassword String @db.VarChar(100)
  nickName String? @db.VarChar(40)
  posts Post[]
}

model Post {
  id Int @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title String
  description String?
  userId Int
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### postgresql にスキーマを反映

```bash
$ npx prisma migrate dev

```

#### DB の内容をブラウザで確認

```bash
$ npx prisma studio
```

#### schema から typescript の型を自動生成

```bash
$ npx prisma generate
```

### 必要なパッケージのインストール

@nestjs/config：nestjs で dotenv を扱うためのライブラリ
@nestjs/jwt：nestjs で jwt を扱うためのライブラリ
@nestjs/passport：nestjs で passport を扱うためのライブラリ
cookie-parser：Express で Cookie を扱うためのライブラリ
csurf：CSRF 対策用のライブラリ
passport：認証機能を扱うためのライブラリ
passport-jwt：jwt で認証機能を扱うためのライブラリ
bcrypt：パスワードをハッシュ化するためのライブラリ
class-validator：フォーム入力値のバリデーションライブラリ
class-transformer：
@types/～：typescript 用の型

```bash
$ yarn add @nestjs/config @nestjs/jwt @nestjs/passport
$ yarn add cookie-parser csurf passport passport-jwt bcrypt class-validator
$ yarn add -D @types/express @types/cookie-parser @types/csurf @types/passport-jwt @types/bcrypt
```

## nest.js の module, controller, service の自動生成

```bash
# 認証用
$ nest g module auth
$ nest g controller auth --no-spec
$ nest g service auth --no-spec

# ユーザー
$ nest g module user
$ nest g controller user --no-spec
$ nest g service user --no-spec

# 投稿
$ nest g module post
$ nest g controller post --no-spec
$ nest g service post --no-spec

# DB操作
$ nest g module prisma
$ nest g service prisma --no-spec
```

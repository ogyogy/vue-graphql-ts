# vue-graphql-ts

Vue + GraphQL + TypeScript 練習用リポジトリ。

- [vue-graphql-ts](#vue-graphql-ts)
  - [使い方](#使い方)
  - [GraphQL サーバー構築手順](#graphql-サーバー構築手順)
    - [初期設定](#初期設定)
    - [Qurey定義](#qurey定義)
    - [スキーマファイル作成](#スキーマファイル作成)
    - [スキーマファイルから TypeScript の型生成](#スキーマファイルから-typescript-の型生成)
  - [GraphQL クライアント構築手順](#graphql-クライアント構築手順)
  - [参考文献](#参考文献)

## 使い方

GraphQL サーバーのインストールを行い起動する。

```bash
cd server
npm install
npm run dev
```

別途GraphQL クライアントのインストールを行い起動する。

```bash
cd client
npm install
npm run serve
```

サーバーとクライアントが両方起動した状態で http://localhost:8080/ にアクセスするとサンプルデータが表示される。

## GraphQL サーバー構築手順

[Apollo Server with TypeScript](https://zenn.dev/intercept6/articles/3daca0298d32d8022e71) を参考に Apollo Server + TypeScript で GraphQL サーバーを構築する。

### 初期設定

```bash
mkdir server
cd server
npx gts init -y
```

packeage.json を開き name を設定する。

```json
{
  "name": "server",
}
```

### Qurey定義

```bash
npm install apollo-server graphql
npm install --save-dev ts-node ts-node-dev
```

src/index.ts の内容を置き換える。

```ts
import { ApolloServer, gql } from 'apollo-server';

// GraphQLスキーマの定義
const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book!]!
  }
`;

// サンプルデータの定義
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

// リゾルバーの定義
const resolvers = {
  Query: {
    books: () => books,
  },
};

// サーバーの起動
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

package.json にサーバー起動コマンドを追記する。

```json
{
    "scripts": {
        "dev": "ts-node-dev --respawn src/index.ts",
        "start": "node build/src/index.js",
        // ...
    }
}
```

tsconfig.json にモジュールインポートの互換設定を追記する。

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    // ...
  }
}
```

開発用サーバーを実行する。

```bash
npm run dev
```

以下のクエリを http://localhost:4000/ に送信する。

オンライン環境の場合はブラウザで [Apollo Sandbox](https://studio.apollographql.com/sandbox/explorer) にアクセスしクエリを送信する。

オフライン環境の場合は Apollo Sandbox が利用できないので cURL を使うか Visual Studio Code 拡張機能の Thunder Client が Postman like で便利。

```graphql
query {
  books {
    author
    title
  }
}
```

### スキーマファイル作成

フロントエンドと共有するためにプロジェクトディレクトリ直下にスキーマファイル schema.graphql を作成する。

```graphql
type Book {
  title: String
  author: String
}

type Query {
  books: [Book!]!
}
```

src/index.ts から typeDefs の定義を削除する。

Apollo Server で Schema を読み込むためのライブラリをインストールする。

```bash
npm install @graphql-tools/load @graphql-tools/schema @graphql-tools/graphql-file-loader
```

src/index.ts の内容を置き換える。

```ts
import { ApolloServer } from 'apollo-server';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { join } from 'path';

// サンプルデータの定義
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

// スキーマの定義
const schema = loadSchemaSync(join(__dirname, '../schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
});

// リゾルバーの定義
const resolvers = {
  Query: {
    books: () => books,
  },
};

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

// サーバーの起動
const server = new ApolloServer({ schema: schemaWithResolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

再度開発用サーバーを実行し、クエリを送信しレスポンスが得られることを確認する。

### スキーマファイルから TypeScript の型生成

[GraphQL Code Generator](https://www.graphql-code-generator.com/) を用いて TypeScript の型を生成する。

```bash
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers
```

プロジェクトディレクトリの直下に config.yml を作成する。

```yml
overwrite: true
generates:
  ./src/types/generated/graphql.ts:
    schema: schema.graphql
    config:
      # type: boolean default: false
      # Adds an index signature to any generates resolver.
      useIndexSignature: true
      # resolver のための Context の型を src/types/context.d.ts から読み込む
      # context から外部のデータを resolver に注入することが可能
      # resolver とは GraphQL における操作の定義
      contextType: ../context#Context
    plugins:
      - typescript
      - typescript-resolvers
```

src/types/context.d.ts に Context の型を定義する。

d.ts ファイルは TypeScript の型定義ファイル。

```ts
export type Context = {
  user?: {
    name: string;
    email: string;
    token: string;
  };
};
```

package.json に型を生成するコマンドを追記する。

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.yml",
  }
}
```

型を生成するコマンドを実行する。

```bash
npm run codegen
```

src/index.ts の内容を書き換える。

```ts
import { ApolloServer, AuthenticationError } from 'apollo-server';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { join } from 'path';
import { Resolvers } from './types/generated/graphql';
import { Context } from './types/context';

// サンプルデータの定義
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

// スキーマの定義
const schema = loadSchemaSync(join(__dirname, '../schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
});

// リゾルバーの定義 (型のサポートを受けれる)
const resolvers: Resolvers = {
  Query: {
    books: (_parent, _args, _context) => {
      // TODO: 詳細な認可処理を行う

      return books;
    },
  },
};

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

const getUser = (token?: string): Context['user'] => {
  if (token === undefined) {
    throw new AuthenticationError(
      '認証されていないユーザーはリソースにアクセスできません'
    );
  }

  // TODO: Tokenからユーザー情報を取り出す処理

  return {
    name: 'dummy name',
    email: 'dummy@example.com',
    token,
  };
};

// サーバーの起動
const server = new ApolloServer({
  schema: schemaWithResolvers,
  context: ({ req }) =>
  ({
    user: getUser(req.headers.authorization),
  } as Context),
  debug: false, // エラーレスポンスにスタックトレースを含ませない、開発環境ではtrueにした方が分析が捗りそう
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

再度開発用サーバーを実行する。

Apollo Sandbox で Authorization ヘッダーを付与した状態でクエリを実行したときサンプルデータが、付与しない状態でクエリを実行したときエラーが返却されることを確認する。

## GraphQL クライアント構築手順

Vue + TypeScript + Apollo Client で GraphQL サーバーのデータを取得する GraphQL クライアントを構築する。

Vue CLI をインストールする。

```bash
npm install -g @vue/cli
```

Vue CLI でプロジェクトを作成する。

作成時 Manually select features を選択し TypeScript を追加する。その他はデフォルト値にする。

```bash
vue create client
```

Apollo Client 実行に必要なパッケージをインストールする。

```bash
npm install --save graphql graphql-tag @apollo/client
```

Composition API を利用するためのパッケージをインストールする。

```bash
npm install --save @vue/apollo-composable
```

GraphQL サーバーで作成した types フォルダを src フォルダに、 schema.graphql ファイルをプロジェクトディレクトリの直下にそれぞれコピーする。

サーバーを起動する。

起動後 http://localhost:8080/ にアクセスし、Vue の Welcome ページが表示されることを確認する。

```bash
npm run serve
```

src/main.ts の内容を置き換える。

```ts
import { createApp, provide, h } from 'vue'
import App from './App.vue'

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { DefaultApolloClient } from '@vue/apollo-composable'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:4000',
})

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // const token = localStorage.getItem('token');
  const token = 'dummy';
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
})

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App),
})

app.mount('#app')
```

src\components\HelloWorld.vue の script の内容を置き換える。

```vue
<script lang="ts">
import { defineComponent } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { Book } from '../types/generated/graphql'

interface BookData {
  books: Array<Book>
}

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  setup() {
    const { result } = useQuery<BookData>(gql`
      query GetBooks {
        books {
          title
          author
        }
      }
    `)
    return { result }
  },
})
</script>
```

http://localhost:8080/ にアクセスしてサンプルデータが表示されていることを確認する。

## 参考文献

- [okojomoeko/react-apollo](https://github.com/okojomoeko/react-apollo)
- [Apollo Server with TypeScript](https://zenn.dev/intercept6/articles/3daca0298d32d8022e71)
- [PostmanがいらなくなるかもしれないVSCodeの拡張機能Thunder Clientがすごい](https://zenn.dev/mseto/articles/vscode-thunder-client)
- [GraphQL Code Generator](https://www.graphql-code-generator.com/)
- [Installation | Vue Apollo](https://v4.apollo.vuejs.org/guide/installation.html)
- [Setup | Vue Apollo](https://v4.apollo.vuejs.org/guide-composable/setup.html)
- [Authentication - Client (React) - Apollo GraphQL Docs](https://www.apollographql.com/docs/react/networking/authentication/)
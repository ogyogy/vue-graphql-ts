<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <ul v-if="result && result.books">
      <li v-for="(book, index) in result.books" :key="index">
        {{ book.title }}/{{ book.author }}
      </li>
    </ul>
  </div>
</template>

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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

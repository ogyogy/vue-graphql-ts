<script setup lang="ts">
import { ref } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { Book } from '../types/generated/graphql'

interface BookData {
  books: Array<Book>
}

defineProps<{ msg: string }>()

const count = ref(0)

const { result } = useQuery<BookData>(gql`
  query GetBooks {
    books {
      title
      author
    }
  }
`)
</script>

<template>
  <h1>{{ msg }}</h1>

  <button type="button" @click="count++">count is: {{ count }}</button>

  <ul v-if="result && result.books">
    <li v-for="(book, index) in result.books" :key="index">
      {{ book.title }}/{{ book.author }}
    </li>
  </ul>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>

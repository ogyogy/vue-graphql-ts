import gql from 'graphql-tag';
import * as VueApolloComposable from '@vue/apollo-composable';
import * as VueCompositionApi from 'vue';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type ReactiveFunction<TParam> = () => TParam;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Book = {
  __typename?: 'Book';
  author?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  books: Array<Book>;
};

export type GetBooksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBooksQuery = { __typename?: 'Query', books: Array<{ __typename?: 'Book', title?: string | null, author?: string | null }> };


export const GetBooksDocument = gql`
    query getBooks {
  books {
    title
    author
  }
}
    `;

/**
 * __useGetBooksQuery__
 *
 * To run a query within a Vue component, call `useGetBooksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBooksQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetBooksQuery();
 */
export function useGetBooksQuery(options: VueApolloComposable.UseQueryOptions<GetBooksQuery, GetBooksQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetBooksQuery, GetBooksQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetBooksQuery, GetBooksQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetBooksQuery, GetBooksQueryVariables>(GetBooksDocument, {}, options);
}
export function useGetBooksLazyQuery(options: VueApolloComposable.UseQueryOptions<GetBooksQuery, GetBooksQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetBooksQuery, GetBooksQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetBooksQuery, GetBooksQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetBooksQuery, GetBooksQueryVariables>(GetBooksDocument, {}, options);
}
export type GetBooksQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetBooksQuery, GetBooksQueryVariables>;
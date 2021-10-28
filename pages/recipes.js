import { Client } from '@notionhq/client'
import { extractRecipeInfo } from '../src/notion'
import Link from 'next/link'
import slugify from 'slugify'

const RecipePage = ({ recipes }) => {
  return recipes.map((recipe) => (
    <p key={recipe.id}>
      <Link href={`/recipes/${slugify(recipe.name).toLowerCase()}`}>
        <a>{recipe.name}</a>
      </Link>
    </p>
  ))
}

export const getStaticProps = async () => {
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  })

  const data = await notion.databases.query({
    database_id: process.env.DATABASE_ID,
  })

  return {
    props: {
      recipes: data.results.map(extractRecipeInfo),
    },
  }
}

export default RecipePage

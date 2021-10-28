import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  Container,
  GridItem,
  Heading,
  HStack,
  ListItem,
  OrderedList,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/layout'
import { Tooltip, Icon, Tag } from '@chakra-ui/react'
import { Stat, StatGroup, StatLabel, StatNumber } from '@chakra-ui/stat'
import { Table, Tbody, Td, Tr } from '@chakra-ui/table'
import { Client } from '@notionhq/client'
import slugify from 'slugify'
import { BsPeopleFill } from 'react-icons/bs'
import { MdOutlineWatchLater } from 'react-icons/md'
import {
  extractIngredientsDbId,
  extractRecipeInfo,
  extractRecipeInstructions,
  extractIngredient,
} from '../../src/notion'

const Recipe = ({ recipe }) => {
  const { ingredients, instructions } = recipe

  return (
    <Container maxW="container.md">
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={10}>
        <GridItem colSpan={{ sm: 1, md: 2 }}>
          <Heading as="h1" size="xl">
            {recipe.name}
          </Heading>
          <HStack justify="flex-start" spacing={4}>
            <HStack>
              <Icon as={BsPeopleFill} />
              <Text>{recipe.serves}</Text>
            </HStack>
            <HStack>
              <Icon as={MdOutlineWatchLater} />
              <Text>{recipe.time}</Text>
            </HStack>
            <Box>
              {recipe.tags.map((tag) => (
                <Tag key={tag} variant="solid" colorScheme="teal" m={1}>
                  {tag}
                </Tag>
              ))}
            </Box>
          </HStack>
        </GridItem>
        <GridItem colSpan={1}>
          <Heading as="h2" size="md">
            Ingredienser
          </Heading>
          <Table variant="unstyled">
            <Tbody>
              {ingredients.map((ingredient) => (
                <Tr key={ingredient.id}>
                  <Td p={1} pl={0}>
                    {ingredient.quantity}
                  </Td>

                  <Td p={1}>
                    {ingredient.name}{' '}
                    {ingredient.description ? (
                      <Tooltip
                        hasArrow
                        label={ingredient.description}
                        bg="gray.300"
                        color="gray.900"
                      >
                        <InfoOutlineIcon />
                      </Tooltip>
                    ) : null}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </GridItem>
        <GridItem columns={1}>
          <Heading as="h2" size="md">
            Instruktioner
          </Heading>
          <OrderedList>
            {instructions.map((instruction) => (
              <ListItem key={instruction}>{instruction}</ListItem>
            ))}
          </OrderedList>
        </GridItem>
      </SimpleGrid>
    </Container>
  )
}

export const getStaticPaths = async () => {
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  })

  const data = await notion.databases.query({
    database_id: process.env.DATABASE_ID,
  })

  const paths = data.results
    .map(extractRecipeInfo)
    .map((recipe) => ({ params: { slug: slugify(recipe.name).toLowerCase() } }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps = async ({ params: { slug } }) => {
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  })

  const data = await notion.databases.query({
    database_id: process.env.DATABASE_ID,
  })

  const recipeInfo = data.results
    .map(extractRecipeInfo)
    .find((recipe) => slugify(recipe.name).toLowerCase() === slug)

  const recipeData = await notion.blocks.children.list({
    block_id: recipeInfo.id,
  })

  const ingredientsDbId = extractIngredientsDbId(recipeData.results)
  const ingredientsData = await notion.databases.query({
    database_id: ingredientsDbId,
    sorts: [
      {
        timestamp: 'created_time',
        direction: 'ascending',
      },
    ],
  })

  const ingredients = ingredientsData.results.map(extractIngredient)
  const instructions = extractRecipeInstructions(recipeData.results)

  return {
    props: {
      recipe: {
        ...recipeInfo,
        ingredients,
        instructions,
      },
    },
  }
}

export default Recipe

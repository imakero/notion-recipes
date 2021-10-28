const isNumberedListItem = (block) => block.type === 'numbered_list_item'
const isChildDatabase = (block) => block.type === 'child_database'
const removeUndefined = (object) =>
  Object.fromEntries(Object.entries(object).filter(([_, v]) => v !== undefined))

export const extractRecipeInfo = (recipe) => ({
  id: recipe.id,
  name: recipe.properties.Name.title[0].plain_text,
  serves: recipe.properties.Serves.number,
  time: recipe.properties.Time.rich_text[0].plain_text,
  tags: recipe.properties.Tags.multi_select.map((tag) => tag.name),
})

export const extractRecipeInstructions = (blocks) =>
  blocks
    .filter(isNumberedListItem)
    .map((block) => block.numbered_list_item.text[0].plain_text)

export const extractIngredientsDbId = (blocks) =>
  blocks.find(isChildDatabase).id

export const extractIngredient = (ingredient) => {
  return removeUndefined({
    id: ingredient.id,
    name: ingredient.properties.Name.title[0].plain_text,
    quantity: ingredient.properties.Quantity.rich_text[0]?.plain_text,
    description: ingredient.properties.Description.rich_text[0]?.plain_text,
  })
}

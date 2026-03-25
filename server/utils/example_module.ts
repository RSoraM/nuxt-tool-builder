import { H3Event } from '#imports'

export const example_module = () => {
  const { example_form } = use_example_module()

  const example_api_handler = async (event: H3Event) => {
    const body = await readValidatedBody(event, example_form.schema.parse)

    return {
      ok: true,
      data: body,
    }
  }

  return {
    ...use_example_module(),
    example_api_handler,
  }
}
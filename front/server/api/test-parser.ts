import { parseText } from '~/utils/textParser';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('Requête reçue avec le texte à analyser');
    
    const result = parseText(body.text);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Erreur dans l\'endpoint:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

import axiosInstance from "~/assets/js/axios";

export default defineEventHandler(async (event) => {
  // Récupère les données envoyées par l'extension
  const body = await readBody(event);

  // Transfère les données au back-end (le cookie HttpOnly sera automatiquement envoyé)
  //   const response = await axiosInstance.post(
  //     "https://mon-backend.com/api/scrapped-data",
  //     body
  //   );

  console.warn("MESSAGE EXTENSION : ", body);
  return body;

  //   return response;
});

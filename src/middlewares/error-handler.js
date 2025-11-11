export const notFoundHandler = (request, response) => {
  response.status(404).json({
    error: "Маршрут не знайдено",
    path: request.url,
  });
}
export function uploadProductImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }

  res.status(201).json({
    image_url: `/uploads/products/${req.file.filename}`
  });
}
import prisma from '../prisma.js';

// GET /api/categories
async function getAllCategories(req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
}

async function createCategory(req, res) {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: 'Could not create category' });
  }
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Could not update category' });
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Could not delete category' });
  }
}

export {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

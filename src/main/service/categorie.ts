import {
  CategoriesResponse,
  Category,
  CategoryForPos,
  CreateCategorieDto,
  UpdateCategorieDto,
} from "../model/categorie";

export async function createCategorie(
  data: {
    entrepriseId: string;
    dto: CreateCategorieDto;
  },
  prisma
): Promise<Category | null> {
  try {
    const { entrepriseId, dto } = data;
    const { nom, showInPos } = dto;
    const newCategorie: Category = await prisma.categorie.create({
      data: {
        nom: nom,
        showInPos: showInPos,
        entreprise: {
          connect: { id: entrepriseId },
        },
      },
      select: {
        id: true,
        nom: true,
        createdAt: true,
        updatedAt: true,
        showInPos: true,
      },
    });

    console.log(newCategorie);
    return newCategorie;
  } catch (error) {
    console.error("service/createCategorie: ", error);
    return null;
  }
}

export async function getCategories(
  data: {
    entrepriseId: string;
    search?: string;
    page: number;
    limit: number;
  },
  prisma
): Promise<CategoriesResponse | null> {
  try {
    const { entrepriseId, search, page, limit } = data;
    const skip = (page - 1) * limit;
    if (!entrepriseId) return null;
    const total = await prisma.categorie.count();
    const totalPages = Math.ceil(total / limit);
    const categories = await prisma.categorie.findMany({
      where: {
        entrepriseId: entrepriseId,
        nom: {
          contains: search,
        },
      },
      skip,
      take: limit,
      select: {
        id: true,
        nom: true,
        createdAt: true,
        showInPos: true,
      },
    });

    return {
      data: categories,
      total,
      page,
      limit,
      totalPages: totalPages ? totalPages : 1,
    };
  } catch (error) {
    console.error("service/getCategories", error);
    return null;
  }
}

export async function getAllCategories(
  data: {
    entrepriseId: string;
  },
  prisma
): Promise<CategoryForPos[] | null> {
  try {
    const { entrepriseId } = data;

    if (!entrepriseId) return null;

    const categories = await prisma.categorie.findMany({
      select: {
        id: true,
        nom: true,
      },
    });

    return categories;
  } catch (error) {
    console.error("service/getAllCategories", error);
    return null;
  }
}

export async function updateCategory(
  data: {
    entrepriseId: string;
    id: string;
    dto: UpdateCategorieDto;
  },
  prisma
): Promise<Category | null> {
  try {
    const { entrepriseId, id, dto } = data;

    if (!entrepriseId || !id || !dto) return null;

    const { nom, showInPos } = dto;
    const updatedCategory = await prisma.categorie.update({
      where: {
        entrepriseId: entrepriseId,
        id: id,
      },
      data: {
        nom: nom,
        showInPos: showInPos,
      },
      select: {
        id: true,
        nom: true,
        createdAt: true,
        updatedAt: true,
        showInPos: true,
      },
    });
    return updatedCategory;
  } catch (error) {
    console.error("service/updateCategory");
    return null;
  }
}

export async function deleteCategory(
  data: {
    entrepriseId: string;
    id: string;
  },
  prisma
) {
  try {
    const { entrepriseId, id } = data;

    if (!id) return null;

    const deletedCategory = prisma.categorie.delete({
      where: {
        id: id,
        entrepriseId: entrepriseId,
      },
      select: {
        id: true,
        nom: true,
      },
    });
    return deletedCategory;
  } catch (error) {
    console.error("service/deleteCategory", error);
  }
}

export async function getCategoriesFor(
  data: { entrepriseId: string },
  prisma
): Promise<CategoryForPos[] | null> {
  try {
    const { entrepriseId } = data;

    if (!entrepriseId) return null;

    const categories = await prisma.categorie.findMany({
      where: {
        entrepriseId: entrepriseId,
      },
      select: {
        id: true,
        nom: true,
        showInPos: true,
      },
      orderBy: {
        nom: "asc",
      },
    });

    return categories;
  } catch (error) {
    console.error("service/getCategoriesFor (POS)", error);
    return null;
  }
}


import { prisma } from "@/lib/prisma/client";

async function upsertUser(supabaseUserId: string, email: string) {
  return prisma.user.upsert({
    where: { email },
    create: { id: supabaseUserId, email },
    update: {},
    select: { id: true },
  });
}

export async function getUserPages(supabaseUserId: string, email: string) {
  const user = await upsertUser(supabaseUserId, email);

  return prisma.page.findMany({
    where: { userId: user.id, isDeleted: false },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, icon: true, parentId: true },
  });
}

export async function createPage(
  supabaseUserId: string,
  email: string,
  parentId?: string
) {
  const user = await upsertUser(supabaseUserId, email);

  return prisma.page.create({
    data: { userId: user.id, ...(parentId ? { parentId } : {}) },
    select: { id: true, title: true },
  });
}

export async function getPage(pageId: string, userId: string) {
  return prisma.page.findFirst({
    where: { id: pageId, userId, isDeleted: false },
    select: {
      id: true,
      title: true,
      icon: true,
      blocks: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, content: true, order: true },
      },
    },
  });
}

export async function updatePageTitle(
  pageId: string,
  userId: string,
  title: string
) {
  return prisma.page.updateMany({
    where: { id: pageId, userId, isDeleted: false },
    data: { title },
  });
}

export async function updatePageIcon(
  pageId: string,
  userId: string,
  icon: string | null
) {
  return prisma.page.updateMany({
    where: { id: pageId, userId, isDeleted: false },
    data: { icon },
  });
}

export async function softDeletePage(pageId: string, userId: string) {
  return prisma.page.updateMany({
    where: { id: pageId, userId, isDeleted: false },
    data: { isDeleted: true },
  });
}

export async function restorePage(pageId: string, userId: string) {
  return prisma.page.updateMany({
    where: { id: pageId, userId, isDeleted: true },
    data: { isDeleted: false },
  });
}

export async function permanentDeletePage(pageId: string, userId: string) {
  return prisma.page.deleteMany({
    where: { id: pageId, userId },
  });
}

export async function getTrashedPages(supabaseUserId: string, email: string) {
  const user = await upsertUser(supabaseUserId, email);

  return prisma.page.findMany({
    where: { userId: user.id, isDeleted: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, icon: true },
  });
}

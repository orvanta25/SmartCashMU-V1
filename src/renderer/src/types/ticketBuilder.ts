// app/utils/ticketBuilder.ts

import { TicketModel, TicketArticle, EntrepriseInfo } from "../types/ticket";

const TICKET_PREFIX = "TKT";

function formatDateFr(date: Date): string {
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' });
}

export function generateTicketNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().replace(/[-:T.]/g, '').slice(2, 14);
  const randomPart = Math.floor(Math.random() * 900 + 100); // 100-999
  return `${TICKET_PREFIX}-${datePart}-${randomPart}`;
}

export function validateTicketArticles(articles: TicketArticle[]): void {
  if (!articles || articles.length === 0) {
    throw new Error("Le ticket doit contenir au moins un article");
  }

  articles.forEach(article => {
    if (article.quantity <= 0) {
      throw new Error(`Quantité invalide pour l'article ${article.name}`);
    }
    if (article.unitPrice <= 0) {
      throw new Error(`Prix unitaire invalide pour l'article ${article.name}`);
    }
    const expectedTotal = Number((article.quantity * article.unitPrice).toFixed(3));
    const actualTotal = Number(article.totalPrice.toFixed(3));
    if (actualTotal !== expectedTotal) {
      throw new Error(`Total incohérent pour l'article ${article.name}`);
    }
  });
}

export function buildTicket(
  articles: TicketArticle[],
  entreprise: EntrepriseInfo,
  caissier: string = "Caissier",
  paymentMethod: "ESPECE" | "TPE" | "TICKET" = "ESPECE"
): TicketModel {
  validateTicketArticles(articles);

  if (!entreprise?.nom) {
    throw new Error("Le nom de l'entreprise est obligatoire");
  }

  const total = articles.reduce((sum, item) => sum + item.totalPrice, 0);
  const formattedDate = formatDateFr(new Date());

  return {
    entreprise,
    articles: [...articles],
    total: Number(total.toFixed(3)),
    ticketNumber: generateTicketNumber(),
    caissier: caissier.trim() || "Caissier",
    date: formattedDate,
    paymentMethod,
  };
}

export function calculateTotal(articles: TicketArticle[]): number {
  return Number(articles.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(3));
}

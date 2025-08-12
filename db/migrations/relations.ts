import { relations } from "drizzle-orm/relations";
import { users, blogPosts, blogPostComments, sessions, confirmationEmailCodes, creditTransactions, creditPackages, carts, cartItems, products, productCollections, collections, productImages, stores, categories, discounts, productDiscounts, collectionDiscounts, categoryImages, shippingZones, accounts } from "./schema";

export const blogPostsRelations = relations(blogPosts, ({one, many}) => ({
	user: one(users, {
		fields: [blogPosts.author],
		references: [users.id]
	}),
	blogPostComments: many(blogPostComments),
}));

export const usersRelations = relations(users, ({many}) => ({
	blogPosts: many(blogPosts),
	blogPostComments: many(blogPostComments),
	sessions: many(sessions),
	confirmationEmailCodes: many(confirmationEmailCodes),
	creditTransactions: many(creditTransactions),
	stores: many(stores),
	carts: many(carts),
	accounts: many(accounts),
}));

export const blogPostCommentsRelations = relations(blogPostComments, ({one}) => ({
	blogPost: one(blogPosts, {
		fields: [blogPostComments.post],
		references: [blogPosts.id]
	}),
	user: one(users, {
		fields: [blogPostComments.author],
		references: [users.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const confirmationEmailCodesRelations = relations(confirmationEmailCodes, ({one}) => ({
	user: one(users, {
		fields: [confirmationEmailCodes.userId],
		references: [users.id]
	}),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({one}) => ({
	user: one(users, {
		fields: [creditTransactions.userId],
		references: [users.id]
	}),
	creditPackage: one(creditPackages, {
		fields: [creditTransactions.packageId],
		references: [creditPackages.id]
	}),
}));

export const creditPackagesRelations = relations(creditPackages, ({many}) => ({
	creditTransactions: many(creditTransactions),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id]
	}),
}));

export const cartsRelations = relations(carts, ({one, many}) => ({
	cartItems: many(cartItems),
	user: one(users, {
		fields: [carts.userId],
		references: [users.id]
	}),
	store: one(stores, {
		fields: [carts.storeId],
		references: [stores.id]
	}),
	shippingZone: one(shippingZones, {
		fields: [carts.shippingZoneId],
		references: [shippingZones.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	cartItems: many(cartItems),
	productCollections: many(productCollections),
	productImages: many(productImages),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	store: one(stores, {
		fields: [products.storeId],
		references: [stores.id]
	}),
	productDiscounts: many(productDiscounts),
}));

export const productCollectionsRelations = relations(productCollections, ({one}) => ({
	product: one(products, {
		fields: [productCollections.productId],
		references: [products.id]
	}),
	collection: one(collections, {
		fields: [productCollections.collectionId],
		references: [collections.id]
	}),
}));

export const collectionsRelations = relations(collections, ({one, many}) => ({
	productCollections: many(productCollections),
	store: one(stores, {
		fields: [collections.storeId],
		references: [stores.id]
	}),
	collectionDiscounts: many(collectionDiscounts),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const storesRelations = relations(stores, ({one, many}) => ({
	user: one(users, {
		fields: [stores.ownerId],
		references: [users.id]
	}),
	collections: many(collections),
	products: many(products),
	discounts: many(discounts),
	categories: many(categories),
	carts: many(carts),
	shippingZones: many(shippingZones),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	products: many(products),
	category: one(categories, {
		fields: [categories.parentId],
		references: [categories.id],
		relationName: "categories_parentId_categories_id"
	}),
	categories: many(categories, {
		relationName: "categories_parentId_categories_id"
	}),
	store: one(stores, {
		fields: [categories.storeId],
		references: [stores.id]
	}),
	categoryImages: many(categoryImages),
}));

export const discountsRelations = relations(discounts, ({one, many}) => ({
	store: one(stores, {
		fields: [discounts.storeId],
		references: [stores.id]
	}),
	productDiscounts: many(productDiscounts),
	collectionDiscounts: many(collectionDiscounts),
}));

export const productDiscountsRelations = relations(productDiscounts, ({one}) => ({
	product: one(products, {
		fields: [productDiscounts.productId],
		references: [products.id]
	}),
	discount: one(discounts, {
		fields: [productDiscounts.discountId],
		references: [discounts.id]
	}),
}));

export const collectionDiscountsRelations = relations(collectionDiscounts, ({one}) => ({
	collection: one(collections, {
		fields: [collectionDiscounts.collectionId],
		references: [collections.id]
	}),
	discount: one(discounts, {
		fields: [collectionDiscounts.discountId],
		references: [discounts.id]
	}),
}));

export const categoryImagesRelations = relations(categoryImages, ({one}) => ({
	category: one(categories, {
		fields: [categoryImages.categoryId],
		references: [categories.id]
	}),
}));

export const shippingZonesRelations = relations(shippingZones, ({one, many}) => ({
	carts: many(carts),
	store: one(stores, {
		fields: [shippingZones.storeId],
		references: [stores.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));
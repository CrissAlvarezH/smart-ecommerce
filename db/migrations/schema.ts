import { pgTable, serial, text, bigint, foreignKey, varchar, timestamp, integer, boolean, uuid, unique, numeric, jsonb, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const drizzleMigrations = pgTable("drizzle_migrations", {
	id: serial("id").primaryKey().notNull(),
	hash: text("hash").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdAt: bigint("created_at", { mode: "number" }),
});

export const blogPosts = pgTable("blog_posts", {
	id: serial("id").primaryKey().notNull(),
	title: varchar("title").notNull(),
	description: text("description").notNull(),
	content: text("content").notNull(),
	date: timestamp("date", { mode: 'string' }).notNull(),
	banner: varchar("banner"),
	author: integer("author").notNull(),
},
(table) => {
	return {
		blogPostsAuthorUsersIdFk: foreignKey({
			columns: [table.author],
			foreignColumns: [users.id],
			name: "blog_posts_author_users_id_fk"
		}),
	}
});

export const blogPostComments = pgTable("blog_post_comments", {
	id: serial("id").primaryKey().notNull(),
	content: varchar("content").notNull(),
	post: integer("post").notNull(),
	date: timestamp("date", { mode: 'string' }).notNull(),
	author: integer("author").notNull(),
},
(table) => {
	return {
		blogPostCommentsPostBlogPostsIdFk: foreignKey({
			columns: [table.post],
			foreignColumns: [blogPosts.id],
			name: "blog_post_comments_post_blog_posts_id_fk"
		}),
		blogPostCommentsAuthorUsersIdFk: foreignKey({
			columns: [table.author],
			foreignColumns: [users.id],
			name: "blog_post_comments_author_users_id_fk"
		}),
	}
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
},
(table) => {
	return {
		sessionsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}),
	}
});

export const confirmationEmailCodes = pgTable("confirmation_email_codes", {
	userId: integer("user_id"),
	code: varchar("code").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		confirmationEmailCodesUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "confirmation_email_codes_user_id_users_id_fk"
		}),
	}
});

export const users = pgTable("users", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 250 }).notNull(),
	email: varchar("email", { length: 250 }).notNull(),
	phone: varchar("phone", { length: 15 }),
	password: varchar("password").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	isEmailValidated: boolean("is_email_validated").default(false),
	picture: varchar("picture"),
	pictureHash: varchar("picture_hash"),
	credits: integer("credits").default(0).notNull(),
});

export const creditTransactions = pgTable("credit_transactions", {
	id: serial("id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	amount: integer("amount").notNull(),
	type: varchar("type").notNull(),
	description: text("description").notNull(),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 200 }),
	packageId: integer("package_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		creditTransactionsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "credit_transactions_user_id_users_id_fk"
		}),
		creditTransactionsPackageIdCreditPackagesIdFk: foreignKey({
			columns: [table.packageId],
			foreignColumns: [creditPackages.id],
			name: "credit_transactions_package_id_credit_packages_id_fk"
		}),
	}
});

export const creditPackages = pgTable("credit_packages", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	credits: integer("credits").notNull(),
	priceCents: integer("price_cents").notNull(),
	stripePriceId: varchar("stripe_price_id", { length: 200 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	cartId: uuid("cart_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer("quantity").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		cartItemsCartIdCartsIdFk: foreignKey({
			columns: [table.cartId],
			foreignColumns: [carts.id],
			name: "cart_items_cart_id_carts_id_fk"
		}).onDelete("cascade"),
		cartItemsProductIdProductsIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "cart_items_product_id_products_id_fk"
		}).onDelete("cascade"),
	}
});

export const productCollections = pgTable("product_collections", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	collectionId: uuid("collection_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		productCollectionsProductIdProductsIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_collections_product_id_products_id_fk"
		}).onDelete("cascade"),
		productCollectionsCollectionIdCollectionsIdFk: foreignKey({
			columns: [table.collectionId],
			foreignColumns: [collections.id],
			name: "product_collections_collection_id_collections_id_fk"
		}).onDelete("cascade"),
	}
});

export const productImages = pgTable("product_images", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	url: text("url").notNull(),
	altText: text("alt_text"),
	position: integer("position").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		productImagesProductIdProductsIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_images_product_id_products_id_fk"
		}).onDelete("cascade"),
	}
});

export const stores = pgTable("stores", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	description: text("description"),
	ownerId: integer("owner_id").notNull(),
	logoUrl: text("logo_url"),
	bannerUrl: text("banner_url"),
	domain: text("domain"),
	email: text("email"),
	phone: text("phone"),
	address: text("address"),
	city: text("city"),
	state: text("state"),
	country: text("country"),
	postalCode: text("postal_code"),
	currency: text("currency").default('USD').notNull(),
	timezone: text("timezone").default('UTC').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		storesOwnerIdUsersIdFk: foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "stores_owner_id_users_id_fk"
		}),
		storesSlugUnique: unique("stores_slug_unique").on(table.slug),
		storesDomainUnique: unique("stores_domain_unique").on(table.domain),
	}
});

export const collections = pgTable("collections", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	description: text("description"),
	imageUrl: text("image_url"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	storeId: uuid("store_id"),
},
(table) => {
	return {
		collectionsStoreIdStoresIdFk: foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "collections_store_id_stores_id_fk"
		}),
	}
});

export const products = pgTable("products", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	description: text("description"),
	shortDescription: text("short_description"),
	price: numeric("price", { precision: 10, scale:  2 }).notNull(),
	compareAtPrice: numeric("compare_at_price", { precision: 10, scale:  2 }),
	sku: text("sku"),
	inventory: integer("inventory").default(0).notNull(),
	weight: numeric("weight", { precision: 8, scale:  2 }),
	categoryId: uuid("category_id"),
	isActive: boolean("is_active").default(true).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	storeId: uuid("store_id"),
},
(table) => {
	return {
		productsCategoryIdCategoriesIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}),
		productsStoreIdStoresIdFk: foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "products_store_id_stores_id_fk"
		}),
	}
});

export const discounts = pgTable("discounts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	percentage: numeric("percentage", { precision: 5, scale:  2 }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	storeId: uuid("store_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		discountsStoreIdStoresIdFk: foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "discounts_store_id_stores_id_fk"
		}),
	}
});

export const productDiscounts = pgTable("product_discounts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	discountId: uuid("discount_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		productDiscountsProductIdProductsIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_discounts_product_id_products_id_fk"
		}).onDelete("cascade"),
		productDiscountsDiscountIdDiscountsIdFk: foreignKey({
			columns: [table.discountId],
			foreignColumns: [discounts.id],
			name: "product_discounts_discount_id_discounts_id_fk"
		}).onDelete("cascade"),
	}
});

export const collectionDiscounts = pgTable("collection_discounts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	collectionId: uuid("collection_id").notNull(),
	discountId: uuid("discount_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		collectionDiscountsCollectionIdCollectionsIdFk: foreignKey({
			columns: [table.collectionId],
			foreignColumns: [collections.id],
			name: "collection_discounts_collection_id_collections_id_fk"
		}).onDelete("cascade"),
		collectionDiscountsDiscountIdDiscountsIdFk: foreignKey({
			columns: [table.discountId],
			foreignColumns: [discounts.id],
			name: "collection_discounts_discount_id_discounts_id_fk"
		}).onDelete("cascade"),
	}
});

export const categories = pgTable("categories", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	description: text("description"),
	imageUrl: text("image_url"),
	parentId: uuid("parent_id"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	storeId: uuid("store_id"),
	bannerUrl: text("banner_url"),
	displayMode: text("display_mode").default('products').notNull(),
},
(table) => {
	return {
		categoriesParentIdCategoriesIdFk: foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "categories_parent_id_categories_id_fk"
		}),
		categoriesStoreIdStoresIdFk: foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "categories_store_id_stores_id_fk"
		}),
	}
});

export const categoryImages = pgTable("category_images", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id").notNull(),
	url: text("url").notNull(),
	altText: text("alt_text"),
	position: integer("position").default(0).notNull(),
	isMain: boolean("is_main").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		categoryImagesCategoryIdCategoriesIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "category_images_category_id_categories_id_fk"
		}).onDelete("cascade"),
	}
});

export const carts = pgTable("carts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: integer("user_id"),
	sessionId: text("session_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	storeId: uuid("store_id"),
	shippingCost: numeric("shipping_cost", { precision: 10, scale:  2 }).default('0.00'),
	shippingAddress: text("shipping_address"),
	shippingCity: text("shipping_city"),
	shippingState: text("shipping_state"),
	shippingCountry: text("shipping_country"),
	shippingPostalCode: text("shipping_postal_code"),
	shippingZoneId: uuid("shipping_zone_id"),
},
(table) => {
	return {
		cartsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "carts_user_id_users_id_fk"
		}).onDelete("cascade"),
		cartsStoreIdStoresIdFk: foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "carts_store_id_stores_id_fk"
		}),
		cartsShippingZoneIdFkey: foreignKey({
			columns: [table.shippingZoneId],
			foreignColumns: [shippingZones.id],
			name: "carts_shipping_zone_id_fkey"
		}),
	}
});

export const shippingZones = pgTable("shipping_zones", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	storeId: uuid("store_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	departments: jsonb("departments").default([]).notNull(),
	cities: jsonb("cities").default([]).notNull(),
	price: numeric("price", { precision: 10, scale:  2 }).default('0').notNull(),
},
(table) => {
	return {
		shippingZonesStoreIdStoresIdFk: foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "shipping_zones_store_id_stores_id_fk"
		}),
	}
});

export const accounts = pgTable("accounts", {
	providerId: varchar("provider_id").notNull(),
	providerUserId: varchar("provider_user_id").notNull(),
	userId: integer("user_id").notNull(),
},
(table) => {
	return {
		accountsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}),
		accountsProviderIdProviderUserIdPk: primaryKey({ columns: [table.providerId, table.providerUserId], name: "accounts_provider_id_provider_user_id_pk"}),
	}
});
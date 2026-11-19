import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BlogBlocksDynamicZoneInput: { input: any; output: any; }
  BlogComponentsDynamicZoneInput: { input: any; output: any; }
  CityBlocksDynamicZoneInput: { input: any; output: any; }
  CityComponentsDynamicZoneInput: { input: any; output: any; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  FooterExtraNavsDynamicZoneInput: { input: any; output: any; }
  FooterNavDynamicZoneInput: { input: any; output: any; }
  I18NLocaleCode: { input: string; output: string; }
  JSON: { input: any; output: any; }
  LocalPageBlocksDynamicZoneInput: { input: any; output: any; }
  LocalPageComponentsDynamicZoneInput: { input: any; output: any; }
  NavigationItemsDynamicZoneInput: { input: any; output: any; }
  PageBlocksDynamicZoneInput: { input: any; output: any; }
  PageComponentsDynamicZoneInput: { input: any; output: any; }
  PageExtraComponentsDynamicZoneInput: { input: any; output: any; }
  PageSectionsDynamicZoneInput: { input: any; output: any; }
  ServicePointComponentsDynamicZoneInput: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export type Announcement = {
  __typename?: 'Announcement';
  closable: Scalars['Boolean']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  enabled: Scalars['Boolean']['output'];
  endsAt: Maybe<Scalars['DateTime']['output']>;
  link: Maybe<ComponentElementsLink>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Announcement>>;
  localizations_connection: Maybe<AnnouncementRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  startsAt: Maybe<Scalars['DateTime']['output']>;
  text: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  variant: Enum_Announcement_Variant;
};

export type AnnouncementInput = {
  closable?: InputMaybe<Scalars['Boolean']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  link?: InputMaybe<ComponentElementsLinkInput>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Enum_Announcement_Variant>;
};

export type AnnouncementRelationResponseCollection = {
  __typename?: 'AnnouncementRelationResponseCollection';
  nodes: Array<Announcement>;
};

export type Blog = {
  __typename?: 'Blog';
  blocks: Maybe<Array<Maybe<BlogBlocksDynamicZone>>>;
  category: Maybe<BlogCategory>;
  components: Maybe<Array<Maybe<BlogComponentsDynamicZone>>>;
  coverImage: UploadFile;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  excerpt: Maybe<Scalars['String']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Blog>>;
  localizations_connection: Maybe<BlogRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  seo: Maybe<ComponentSharedSeo>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type BlogLocalizationsArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type BlogLocalizations_ConnectionArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type BlogBlocksDynamicZone = ComponentBlocksBlogPosts | ComponentBlocksCars | ComponentBlocksComparison | ComponentBlocksContact | ComponentBlocksContent | ComponentBlocksCtaBand | ComponentBlocksFaq | ComponentBlocksFeatures | ComponentBlocksHero | ComponentBlocksLeadForm | ComponentBlocksLocations | ComponentBlocksLogos | ComponentBlocksMediaText | ComponentBlocksPromoCards | ComponentBlocksReviews | ComponentBlocksScenarios | ComponentBlocksTrustBar | Error;

export type BlogCategory = {
  __typename?: 'BlogCategory';
  blogs: Array<Maybe<Blog>>;
  blogs_connection: Maybe<BlogRelationResponseCollection>;
  color: Maybe<Enum_Blogcategory_Color>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<BlogCategory>>;
  localizations_connection: Maybe<BlogCategoryRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type BlogCategoryBlogsArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type BlogCategoryBlogs_ConnectionArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type BlogCategoryLocalizationsArgs = {
  filters: InputMaybe<BlogCategoryFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type BlogCategoryLocalizations_ConnectionArgs = {
  filters: InputMaybe<BlogCategoryFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type BlogCategoryEntityResponseCollection = {
  __typename?: 'BlogCategoryEntityResponseCollection';
  nodes: Array<BlogCategory>;
  pageInfo: Pagination;
};

export type BlogCategoryFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<BlogCategoryFiltersInput>>>;
  blogs?: InputMaybe<BlogFiltersInput>;
  color?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<BlogCategoryFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<BlogCategoryFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<BlogCategoryFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type BlogCategoryInput = {
  blogs?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  color?: InputMaybe<Enum_Blogcategory_Color>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type BlogCategoryRelationResponseCollection = {
  __typename?: 'BlogCategoryRelationResponseCollection';
  nodes: Array<BlogCategory>;
};

export type BlogComponentsDynamicZone = ComponentSharedBasicText | ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type BlogEntityResponseCollection = {
  __typename?: 'BlogEntityResponseCollection';
  nodes: Array<Blog>;
  pageInfo: Pagination;
};

export type BlogFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<BlogFiltersInput>>>;
  category?: InputMaybe<BlogCategoryFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  excerpt?: InputMaybe<StringFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<BlogFiltersInput>;
  not?: InputMaybe<BlogFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<BlogFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  seo?: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type BlogInput = {
  blocks?: InputMaybe<Array<Scalars['BlogBlocksDynamicZoneInput']['input']>>;
  category?: InputMaybe<Scalars['ID']['input']>;
  components?: InputMaybe<Array<Scalars['BlogComponentsDynamicZoneInput']['input']>>;
  coverImage?: InputMaybe<Scalars['ID']['input']>;
  excerpt?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  seo?: InputMaybe<ComponentSharedSeoInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type BlogRelationResponseCollection = {
  __typename?: 'BlogRelationResponseCollection';
  nodes: Array<Blog>;
};

export type BooleanFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  contains?: InputMaybe<Scalars['Boolean']['input']>;
  containsi?: InputMaybe<Scalars['Boolean']['input']>;
  endsWith?: InputMaybe<Scalars['Boolean']['input']>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  eqi?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  nei?: InputMaybe<Scalars['Boolean']['input']>;
  not?: InputMaybe<BooleanFilterInput>;
  notContains?: InputMaybe<Scalars['Boolean']['input']>;
  notContainsi?: InputMaybe<Scalars['Boolean']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  startsWith?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CarCollection = {
  __typename?: 'CarCollection';
  bodies: Maybe<Scalars['JSON']['output']>;
  categories: Maybe<Scalars['JSON']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  fuels: Maybe<Scalars['JSON']['output']>;
  gearboxes: Maybe<Scalars['JSON']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<CarCollection>>;
  localizations_connection: Maybe<CarCollectionRelationResponseCollection>;
  minSeats: Maybe<Scalars['Int']['output']>;
  onlyPopular: Maybe<Scalars['Boolean']['output']>;
  onlyPromotion: Maybe<Scalars['Boolean']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  segmentIds: Maybe<Scalars['JSON']['output']>;
  sort: Enum_Carcollection_Sort;
  title: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type CarCollectionLocalizationsArgs = {
  filters: InputMaybe<CarCollectionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CarCollectionLocalizations_ConnectionArgs = {
  filters: InputMaybe<CarCollectionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CarCollectionEntityResponseCollection = {
  __typename?: 'CarCollectionEntityResponseCollection';
  nodes: Array<CarCollection>;
  pageInfo: Pagination;
};

export type CarCollectionFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<CarCollectionFiltersInput>>>;
  bodies?: InputMaybe<JsonFilterInput>;
  categories?: InputMaybe<JsonFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  fuels?: InputMaybe<JsonFilterInput>;
  gearboxes?: InputMaybe<JsonFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<CarCollectionFiltersInput>;
  minSeats?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<CarCollectionFiltersInput>;
  onlyPopular?: InputMaybe<BooleanFilterInput>;
  onlyPromotion?: InputMaybe<BooleanFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CarCollectionFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  segmentIds?: InputMaybe<JsonFilterInput>;
  sort?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type CarCollectionInput = {
  bodies?: InputMaybe<Scalars['JSON']['input']>;
  categories?: InputMaybe<Scalars['JSON']['input']>;
  fuels?: InputMaybe<Scalars['JSON']['input']>;
  gearboxes?: InputMaybe<Scalars['JSON']['input']>;
  minSeats?: InputMaybe<Scalars['Int']['input']>;
  onlyPopular?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPromotion?: InputMaybe<Scalars['Boolean']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  segmentIds?: InputMaybe<Scalars['JSON']['input']>;
  sort?: InputMaybe<Enum_Carcollection_Sort>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CarCollectionRelationResponseCollection = {
  __typename?: 'CarCollectionRelationResponseCollection';
  nodes: Array<CarCollection>;
};

export type City = {
  __typename?: 'City';
  apiReference: Maybe<Scalars['String']['output']>;
  blocks: Maybe<Array<Maybe<CityBlocksDynamicZone>>>;
  components: Maybe<Array<Maybe<CityComponentsDynamicZone>>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  kind: Maybe<Enum_City_Kind>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<City>>;
  localizations_connection: Maybe<CityRelationResponseCollection>;
  pickupPoint: Maybe<Scalars['Int']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  seo: Maybe<ComponentSharedSeo>;
  shortName: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type CityLocalizationsArgs = {
  filters: InputMaybe<CityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CityLocalizations_ConnectionArgs = {
  filters: InputMaybe<CityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CityBlocksDynamicZone = ComponentBlocksBlogPosts | ComponentBlocksCars | ComponentBlocksComparison | ComponentBlocksContact | ComponentBlocksContent | ComponentBlocksCtaBand | ComponentBlocksFaq | ComponentBlocksFeatures | ComponentBlocksHero | ComponentBlocksLeadForm | ComponentBlocksLocations | ComponentBlocksLogos | ComponentBlocksMediaText | ComponentBlocksPromoCards | ComponentBlocksReviews | ComponentBlocksScenarios | ComponentBlocksTrustBar | Error;

export type CityComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedMap | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type CityEntityResponseCollection = {
  __typename?: 'CityEntityResponseCollection';
  nodes: Array<City>;
  pageInfo: Pagination;
};

export type CityFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<CityFiltersInput>>>;
  apiReference?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  kind?: InputMaybe<StringFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<CityFiltersInput>;
  not?: InputMaybe<CityFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<CityFiltersInput>>>;
  pickupPoint?: InputMaybe<IntFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  seo?: InputMaybe<ComponentSharedSeoFiltersInput>;
  shortName?: InputMaybe<StringFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type CityInput = {
  apiReference?: InputMaybe<Scalars['String']['input']>;
  blocks?: InputMaybe<Array<Scalars['CityBlocksDynamicZoneInput']['input']>>;
  components?: InputMaybe<Array<Scalars['CityComponentsDynamicZoneInput']['input']>>;
  kind?: InputMaybe<Enum_City_Kind>;
  pickupPoint?: InputMaybe<Scalars['Int']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  seo?: InputMaybe<ComponentSharedSeoInput>;
  shortName?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CityRelationResponseCollection = {
  __typename?: 'CityRelationResponseCollection';
  nodes: Array<City>;
};

export type ComponentBlocksBlogPosts = {
  __typename?: 'ComponentBlocksBlogPosts';
  badge: Maybe<Scalars['String']['output']>;
  category: Maybe<BlogCategory>;
  cta: Maybe<ComponentElementsCta>;
  id: Scalars['ID']['output'];
  limit: Maybe<Scalars['Int']['output']>;
  posts: Array<Maybe<Blog>>;
  posts_connection: Maybe<BlogRelationResponseCollection>;
  source: Enum_Componentblocksblogposts_Source;
  subtitle: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};


export type ComponentBlocksBlogPostsPostsArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentBlocksBlogPostsPosts_ConnectionArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksCars = {
  __typename?: 'ComponentBlocksCars';
  category: Maybe<Enum_Componentblockscars_Category>;
  cta: Maybe<ComponentElementsLink>;
  defaultCategory: Maybe<Enum_Componentblockscars_Defaultcategory>;
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  layout: Enum_Componentblockscars_Layout;
  limit: Maybe<Scalars['Int']['output']>;
  onlyPromotions: Maybe<Scalars['Boolean']['output']>;
  section: Maybe<ComponentElementsSection>;
  segmentIds: Maybe<Scalars['JSON']['output']>;
  source: Enum_Componentblockscars_Source;
};

export type ComponentBlocksComparison = {
  __typename?: 'ComponentBlocksComparison';
  columns: Array<Maybe<ComponentElementsComparisonColumn>>;
  footnote: Maybe<Scalars['String']['output']>;
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  rows: Array<Maybe<ComponentElementsComparisonRow>>;
  section: Maybe<ComponentElementsSection>;
};


export type ComponentBlocksComparisonColumnsArgs = {
  filters: InputMaybe<ComponentElementsComparisonColumnFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentBlocksComparisonRowsArgs = {
  filters: InputMaybe<ComponentElementsComparisonRowFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksContact = {
  __typename?: 'ComponentBlocksContact';
  departments: Maybe<Array<Maybe<ComponentElementsDepartment>>>;
  formTopics: Maybe<Array<Maybe<ComponentElementsListItem>>>;
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  section: Maybe<ComponentElementsSection>;
  showCompany: Maybe<Scalars['Boolean']['output']>;
};


export type ComponentBlocksContactDepartmentsArgs = {
  filters: InputMaybe<ComponentElementsDepartmentFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentBlocksContactFormTopicsArgs = {
  filters: InputMaybe<ComponentElementsListItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksContent = {
  __typename?: 'ComponentBlocksContent';
  align: Maybe<Enum_Componentblockscontent_Align>;
  body: Maybe<Scalars['String']['output']>;
  collapsedLabel: Maybe<Scalars['String']['output']>;
  collapsible: Maybe<Scalars['Boolean']['output']>;
  ctas: Maybe<Array<Maybe<ComponentElementsCta>>>;
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  previewParagraphs: Maybe<Scalars['Int']['output']>;
  section: Maybe<ComponentElementsSection>;
};


export type ComponentBlocksContentCtasArgs = {
  filters: InputMaybe<ComponentElementsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksCtaBand = {
  __typename?: 'ComponentBlocksCtaBand';
  eyebrow: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imageMobile: Maybe<UploadFile>;
  media: Maybe<UploadFile>;
  primary: ComponentElementsLink;
  secondary: Maybe<ComponentElementsLink>;
  showStoreBadges: Maybe<Scalars['Boolean']['output']>;
  text: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  tone: Enum_Componentblocksctaband_Tone;
  variant: Maybe<Enum_Componentblocksctaband_Variant>;
};

export type ComponentBlocksFaq = {
  __typename?: 'ComponentBlocksFaq';
  cta: Maybe<ComponentElementsLink>;
  groupByCategory: Maybe<Scalars['Boolean']['output']>;
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  items: Array<Maybe<ComponentElementsFaqItem>>;
  section: Maybe<ComponentElementsSection>;
  structuredData: Maybe<Scalars['Boolean']['output']>;
};


export type ComponentBlocksFaqItemsArgs = {
  filters: InputMaybe<ComponentElementsFaqItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksFeatures = {
  __typename?: 'ComponentBlocksFeatures';
  id: Scalars['ID']['output'];
  items: Array<Maybe<ComponentElementsFeature>>;
  title: Maybe<Scalars['String']['output']>;
  variant: Enum_Componentblocksfeatures_Variant;
};


export type ComponentBlocksFeaturesItemsArgs = {
  filters: InputMaybe<ComponentElementsFeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksHero = {
  __typename?: 'ComponentBlocksHero';
  backgroundImage: Maybe<UploadFile>;
  backgroundImageMobile: Maybe<UploadFile>;
  backgroundVideo: Maybe<UploadFile>;
  badge: Maybe<Scalars['String']['output']>;
  breadcrumbLabel: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentElementsCta>>>;
  focalPoint: Maybe<Enum_Componentblockshero_Focalpoint>;
  height: Enum_Componentblockshero_Height;
  highlights: Maybe<Array<Maybe<ComponentElementsHighlight>>>;
  id: Scalars['ID']['output'];
  layout: Maybe<Enum_Componentblockshero_Layout>;
  overlay: Enum_Componentblockshero_Overlay;
  reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm;
  reservationLayout: Enum_Componentblockshero_Reservationlayout;
  searchSide: Maybe<Enum_Componentblockshero_Searchside>;
  subtitle: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  trust: Maybe<ComponentBlocksTrustBar>;
};


export type ComponentBlocksHeroCtasArgs = {
  filters: InputMaybe<ComponentElementsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentBlocksHeroHighlightsArgs = {
  filters: InputMaybe<ComponentElementsHighlightFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksLeadForm = {
  __typename?: 'ComponentBlocksLeadForm';
  consent: Scalars['String']['output'];
  contactText: Maybe<Scalars['String']['output']>;
  contactTitle: Maybe<Scalars['String']['output']>;
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  section: Maybe<ComponentElementsSection>;
  steps: Maybe<Array<Maybe<ComponentElementsListItem>>>;
  successText: Maybe<Scalars['String']['output']>;
  successTitle: Scalars['String']['output'];
  variant: Enum_Componentblocksleadform_Variant;
};


export type ComponentBlocksLeadFormStepsArgs = {
  filters: InputMaybe<ComponentElementsListItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksLocations = {
  __typename?: 'ComponentBlocksLocations';
  city: Maybe<Scalars['String']['output']>;
  filter: Enum_Componentblockslocations_Filter;
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  layout: Maybe<Enum_Componentblockslocations_Layout>;
  section: Maybe<ComponentElementsSection>;
  showMap: Maybe<Scalars['Boolean']['output']>;
};

export type ComponentBlocksLogos = {
  __typename?: 'ComponentBlocksLogos';
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  items: Array<Maybe<ComponentElementsLogo>>;
  section: Maybe<ComponentElementsSection>;
};


export type ComponentBlocksLogosItemsArgs = {
  filters: InputMaybe<ComponentElementsLogoFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksMediaText = {
  __typename?: 'ComponentBlocksMediaText';
  body: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentElementsCta>>>;
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  image: UploadFile;
  imagePosition: Maybe<Enum_Componentblocksmediatext_Imageposition>;
  imageStyle: Maybe<Enum_Componentblocksmediatext_Imagestyle>;
  section: Maybe<ComponentElementsSection>;
};


export type ComponentBlocksMediaTextCtasArgs = {
  filters: InputMaybe<ComponentElementsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksPromoCards = {
  __typename?: 'ComponentBlocksPromoCards';
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  items: Array<Maybe<ComponentElementsPromo>>;
  section: Maybe<ComponentElementsSection>;
};


export type ComponentBlocksPromoCardsItemsArgs = {
  filters: InputMaybe<ComponentElementsPromoFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksReviews = {
  __typename?: 'ComponentBlocksReviews';
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  layout: Maybe<Enum_Componentblocksreviews_Layout>;
  limit: Maybe<Scalars['Int']['output']>;
  section: Maybe<ComponentElementsSection>;
  showSummary: Maybe<Scalars['Boolean']['output']>;
  source: Maybe<Enum_Componentblocksreviews_Source>;
};

export type ComponentBlocksRichText = {
  __typename?: 'ComponentBlocksRichText';
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  settings: Maybe<ComponentElementsSettings>;
  title: Maybe<Scalars['String']['output']>;
};

export type ComponentBlocksScenarios = {
  __typename?: 'ComponentBlocksScenarios';
  header: Maybe<ComponentElementsSectionHeader>;
  id: Scalars['ID']['output'];
  items: Array<Maybe<ComponentElementsScenario>>;
  layout: Maybe<Enum_Componentblocksscenarios_Layout>;
  section: Maybe<ComponentElementsSection>;
};


export type ComponentBlocksScenariosItemsArgs = {
  filters: InputMaybe<ComponentElementsScenarioFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksTrustBar = {
  __typename?: 'ComponentBlocksTrustBar';
  claims: Maybe<Array<Maybe<ComponentElementsHighlight>>>;
  id: Scalars['ID']['output'];
  showRating: Maybe<Scalars['Boolean']['output']>;
  stats: Maybe<Array<Maybe<ComponentElementsStatRef>>>;
  variant: Enum_Componentblockstrustbar_Variant;
};


export type ComponentBlocksTrustBarClaimsArgs = {
  filters: InputMaybe<ComponentElementsHighlightFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentBlocksTrustBarStatsArgs = {
  filters: InputMaybe<ComponentElementsStatRefFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentElementsComparisonColumn = {
  __typename?: 'ComponentElementsComparisonColumn';
  highlighted: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
};

export type ComponentElementsComparisonColumnFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsComparisonColumnFiltersInput>>>;
  highlighted?: InputMaybe<BooleanFilterInput>;
  label?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentElementsComparisonColumnFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsComparisonColumnFiltersInput>>>;
};

export type ComponentElementsComparisonRow = {
  __typename?: 'ComponentElementsComparisonRow';
  criterion: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  values: Maybe<Array<Maybe<ComponentElementsComparisonValue>>>;
};


export type ComponentElementsComparisonRowValuesArgs = {
  filters: InputMaybe<ComponentElementsComparisonValueFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentElementsComparisonRowFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsComparisonRowFiltersInput>>>;
  criterion?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentElementsComparisonRowFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsComparisonRowFiltersInput>>>;
  values?: InputMaybe<ComponentElementsComparisonValueFiltersInput>;
};

export type ComponentElementsComparisonValue = {
  __typename?: 'ComponentElementsComparisonValue';
  id: Scalars['ID']['output'];
  kind: Enum_Componentelementscomparisonvalue_Kind;
  text: Maybe<Scalars['String']['output']>;
};

export type ComponentElementsComparisonValueFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsComparisonValueFiltersInput>>>;
  kind?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentElementsComparisonValueFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsComparisonValueFiltersInput>>>;
  text?: InputMaybe<StringFilterInput>;
};

export type ComponentElementsCta = {
  __typename?: 'ComponentElementsCta';
  icon: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  link: ComponentElementsLink;
  variant: Enum_Componentelementscta_Variant;
};

export type ComponentElementsCtaFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsCtaFiltersInput>>>;
  icon?: InputMaybe<StringFilterInput>;
  link?: InputMaybe<ComponentElementsLinkFiltersInput>;
  not?: InputMaybe<ComponentElementsCtaFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsCtaFiltersInput>>>;
  variant?: InputMaybe<StringFilterInput>;
};

export type ComponentElementsDepartment = {
  __typename?: 'ComponentElementsDepartment';
  email: Maybe<Scalars['String']['output']>;
  hours: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  link: Maybe<ComponentElementsLink>;
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  schedule: Maybe<Array<Maybe<ComponentElementsOpeningHours>>>;
  showInFooter: Maybe<Scalars['Boolean']['output']>;
  text: Maybe<Scalars['String']['output']>;
};


export type ComponentElementsDepartmentScheduleArgs = {
  filters: InputMaybe<ComponentElementsOpeningHoursFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentElementsDepartmentFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsDepartmentFiltersInput>>>;
  email?: InputMaybe<StringFilterInput>;
  hours?: InputMaybe<StringFilterInput>;
  link?: InputMaybe<ComponentElementsLinkFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentElementsDepartmentFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsDepartmentFiltersInput>>>;
  phone?: InputMaybe<StringFilterInput>;
  schedule?: InputMaybe<ComponentElementsOpeningHoursFiltersInput>;
  showInFooter?: InputMaybe<BooleanFilterInput>;
  text?: InputMaybe<StringFilterInput>;
};

export type ComponentElementsDepartmentInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  hours?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  link?: InputMaybe<ComponentElementsLinkInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  schedule?: InputMaybe<Array<InputMaybe<ComponentElementsOpeningHoursInput>>>;
  showInFooter?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type ComponentElementsFaqItem = {
  __typename?: 'ComponentElementsFaqItem';
  answer: Scalars['String']['output'];
  category: Maybe<FaqCategory>;
  id: Scalars['ID']['output'];
  question: Scalars['String']['output'];
};

export type ComponentElementsFaqItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsFaqItemFiltersInput>>>;
  answer?: InputMaybe<StringFilterInput>;
  category?: InputMaybe<FaqCategoryFiltersInput>;
  not?: InputMaybe<ComponentElementsFaqItemFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsFaqItemFiltersInput>>>;
  question?: InputMaybe<StringFilterInput>;
};

export type ComponentElementsFeature = {
  __typename?: 'ComponentElementsFeature';
  icon: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imageMobile: Maybe<UploadFile>;
  link: Maybe<ComponentElementsLink>;
  text: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  tone: Maybe<Enum_Componentelementsfeature_Tone>;
};

export type ComponentElementsFeatureFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsFeatureFiltersInput>>>;
  icon?: InputMaybe<StringFilterInput>;
  link?: InputMaybe<ComponentElementsLinkFiltersInput>;
  not?: InputMaybe<ComponentElementsFeatureFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsFeatureFiltersInput>>>;
  text?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  tone?: InputMaybe<StringFilterInput>;
};

export type ComponentElementsHighlight = {
  __typename?: 'ComponentElementsHighlight';
  icon: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
};

export type ComponentElementsHighlightFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsHighlightFiltersInput>>>;
  icon?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentElementsHighlightFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsHighlightFiltersInput>>>;
  text?: InputMaybe<StringFilterInput>;
};

export type ComponentElementsLink = {
  __typename?: 'ComponentElementsLink';
  blog: Maybe<Blog>;
  customUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label: Maybe<Scalars['String']['output']>;
  linkType: Enum_Componentelementslink_Linktype;
  localPage: Maybe<LocalPage>;
  newTab: Maybe<Scalars['Boolean']['output']>;
  page: Maybe<Page>;
  sale: Maybe<Sale>;
};

export type ComponentElementsLinkFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsLinkFiltersInput>>>;
  blog?: InputMaybe<BlogFiltersInput>;
  customUrl?: InputMaybe<StringFilterInput>;
  label?: InputMaybe<StringFilterInput>;
  linkType?: InputMaybe<StringFilterInput>;
  localPage?: InputMaybe<LocalPageFiltersInput>;
  newTab?: InputMaybe<BooleanFilterInput>;
  not?: InputMaybe<ComponentElementsLinkFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsLinkFiltersInput>>>;
  page?: InputMaybe<PageFiltersInput>;
  sale?: InputMaybe<SaleFiltersInput>;
};

export type ComponentElementsLinkInput = {
  blog?: InputMaybe<Scalars['ID']['input']>;
  customUrl?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  linkType?: InputMaybe<Enum_Componentelementslink_Linktype>;
  localPage?: InputMaybe<Scalars['ID']['input']>;
  newTab?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['ID']['input']>;
  sale?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentElementsListItem = {
  __typename?: 'ComponentElementsListItem';
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
};

export type ComponentElementsListItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsListItemFiltersInput>>>;
  not?: InputMaybe<ComponentElementsListItemFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsListItemFiltersInput>>>;
  text?: InputMaybe<StringFilterInput>;
};

export type ComponentElementsLogo = {
  __typename?: 'ComponentElementsLogo';
  id: Scalars['ID']['output'];
  image: UploadFile;
  name: Scalars['String']['output'];
};

export type ComponentElementsLogoFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsLogoFiltersInput>>>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentElementsLogoFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsLogoFiltersInput>>>;
};

export type ComponentElementsOpeningHours = {
  __typename?: 'ComponentElementsOpeningHours';
  closed: Maybe<Scalars['Boolean']['output']>;
  days: Scalars['JSON']['output'];
  from: Maybe<Scalars['Time']['output']>;
  id: Scalars['ID']['output'];
  to: Maybe<Scalars['Time']['output']>;
};

export type ComponentElementsOpeningHoursFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsOpeningHoursFiltersInput>>>;
  closed?: InputMaybe<BooleanFilterInput>;
  days?: InputMaybe<JsonFilterInput>;
  from?: InputMaybe<TimeFilterInput>;
  not?: InputMaybe<ComponentElementsOpeningHoursFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsOpeningHoursFiltersInput>>>;
  to?: InputMaybe<TimeFilterInput>;
};

export type ComponentElementsOpeningHoursInput = {
  closed?: InputMaybe<Scalars['Boolean']['input']>;
  days?: InputMaybe<Scalars['JSON']['input']>;
  from?: InputMaybe<Scalars['Time']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  to?: InputMaybe<Scalars['Time']['input']>;
};

export type ComponentElementsPromo = {
  __typename?: 'ComponentElementsPromo';
  code: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imageMobile: Maybe<UploadFile>;
  link: Maybe<ComponentElementsLink>;
  termsLink: Maybe<ComponentElementsLink>;
  text: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  tone: Maybe<Enum_Componentelementspromo_Tone>;
  validFrom: Maybe<Scalars['Date']['output']>;
  validUntil: Maybe<Scalars['Date']['output']>;
};

export type ComponentElementsPromoFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsPromoFiltersInput>>>;
  code?: InputMaybe<StringFilterInput>;
  link?: InputMaybe<ComponentElementsLinkFiltersInput>;
  not?: InputMaybe<ComponentElementsPromoFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsPromoFiltersInput>>>;
  termsLink?: InputMaybe<ComponentElementsLinkFiltersInput>;
  text?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  tone?: InputMaybe<StringFilterInput>;
  validFrom?: InputMaybe<DateFilterInput>;
  validUntil?: InputMaybe<DateFilterInput>;
};

export type ComponentElementsScenario = {
  __typename?: 'ComponentElementsScenario';
  audience: Maybe<Scalars['String']['output']>;
  benefits: Maybe<Array<Maybe<ComponentElementsListItem>>>;
  cta: Maybe<ComponentElementsLink>;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imageMobile: Maybe<UploadFile>;
  label: Scalars['String']['output'];
  text: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};


export type ComponentElementsScenarioBenefitsArgs = {
  filters: InputMaybe<ComponentElementsListItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentElementsScenarioFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsScenarioFiltersInput>>>;
  audience?: InputMaybe<StringFilterInput>;
  benefits?: InputMaybe<ComponentElementsListItemFiltersInput>;
  cta?: InputMaybe<ComponentElementsLinkFiltersInput>;
  label?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentElementsScenarioFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsScenarioFiltersInput>>>;
  text?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
};

export type ComponentElementsSection = {
  __typename?: 'ComponentElementsSection';
  anchor: Maybe<Scalars['String']['output']>;
  background: Maybe<Enum_Componentelementssection_Background>;
  backgroundImage: Maybe<UploadFile>;
  backgroundImageMobile: Maybe<UploadFile>;
  id: Scalars['ID']['output'];
  ornament: Maybe<Enum_Componentelementssection_Ornament>;
  spacing: Maybe<Enum_Componentelementssection_Spacing>;
  tone: Maybe<Enum_Componentelementssection_Tone>;
  width: Maybe<Enum_Componentelementssection_Width>;
};

export type ComponentElementsSectionHeader = {
  __typename?: 'ComponentElementsSectionHeader';
  eyebrow: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lead: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export type ComponentElementsSeo = {
  __typename?: 'ComponentElementsSeo';
  id: Scalars['ID']['output'];
  keywords: Maybe<Scalars['String']['output']>;
  metaDescription: Maybe<Scalars['String']['output']>;
  metaTitle: Maybe<Scalars['String']['output']>;
  noFollow: Scalars['Boolean']['output'];
  noIndex: Scalars['Boolean']['output'];
  shareImage: Maybe<UploadFile>;
};

export type ComponentElementsSeoInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  keywords?: InputMaybe<Scalars['String']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaTitle?: InputMaybe<Scalars['String']['input']>;
  noFollow?: InputMaybe<Scalars['Boolean']['input']>;
  noIndex?: InputMaybe<Scalars['Boolean']['input']>;
  shareImage?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentElementsSettings = {
  __typename?: 'ComponentElementsSettings';
  containerWidth: Maybe<Enum_Componentelementssettings_Containerwidth>;
  id: Scalars['ID']['output'];
  sectionId: Maybe<Scalars['String']['output']>;
  spacingBottom: Maybe<Enum_Componentelementssettings_Spacingbottom>;
  spacingTop: Maybe<Enum_Componentelementssettings_Spacingtop>;
  theme: Maybe<Enum_Componentelementssettings_Theme>;
};

export type ComponentElementsStatRef = {
  __typename?: 'ComponentElementsStatRef';
  id: Scalars['ID']['output'];
  kind: Enum_Componentelementsstatref_Kind;
};

export type ComponentElementsStatRefFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentElementsStatRefFiltersInput>>>;
  kind?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentElementsStatRefFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentElementsStatRefFiltersInput>>>;
};

export type ComponentMenuGroup = {
  __typename?: 'ComponentMenuGroup';
  id: Scalars['ID']['output'];
  links: Maybe<Array<Maybe<ComponentElementsLink>>>;
  title: Scalars['String']['output'];
};


export type ComponentMenuGroupLinksArgs = {
  filters: InputMaybe<ComponentElementsLinkFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentMenuGroupFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentMenuGroupFiltersInput>>>;
  links?: InputMaybe<ComponentElementsLinkFiltersInput>;
  not?: InputMaybe<ComponentMenuGroupFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentMenuGroupFiltersInput>>>;
  title?: InputMaybe<StringFilterInput>;
};

export type ComponentMenuGroupInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  links?: InputMaybe<Array<InputMaybe<ComponentElementsLinkInput>>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ComponentMenuItem = {
  __typename?: 'ComponentMenuItem';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  link: Maybe<ComponentElementsLink>;
  links: Maybe<Array<Maybe<ComponentElementsLink>>>;
  submenu: Enum_Componentmenuitem_Submenu;
};


export type ComponentMenuItemLinksArgs = {
  filters: InputMaybe<ComponentElementsLinkFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentMenuItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentMenuItemFiltersInput>>>;
  label?: InputMaybe<StringFilterInput>;
  link?: InputMaybe<ComponentElementsLinkFiltersInput>;
  links?: InputMaybe<ComponentElementsLinkFiltersInput>;
  not?: InputMaybe<ComponentMenuItemFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentMenuItemFiltersInput>>>;
  submenu?: InputMaybe<StringFilterInput>;
};

export type ComponentMenuItemInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  link?: InputMaybe<ComponentElementsLinkInput>;
  links?: InputMaybe<Array<InputMaybe<ComponentElementsLinkInput>>>;
  submenu?: InputMaybe<Enum_Componentmenuitem_Submenu>;
};

export type ComponentPartsBackground = {
  __typename?: 'ComponentPartsBackground';
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imageMobile: Maybe<UploadFile>;
  pattern: Maybe<Scalars['Boolean']['output']>;
  tone: Enum_Componentpartsbackground_Tone;
};

export type ComponentPartsCard = {
  __typename?: 'ComponentPartsCard';
  icon: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imageMobile: Maybe<UploadFile>;
  link: Maybe<ComponentPartsLink>;
  pattern: Maybe<Scalars['Boolean']['output']>;
  text: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  tone: Enum_Componentpartscard_Tone;
};

export type ComponentPartsCardFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentPartsCardFiltersInput>>>;
  icon?: InputMaybe<StringFilterInput>;
  link?: InputMaybe<ComponentPartsLinkFiltersInput>;
  not?: InputMaybe<ComponentPartsCardFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentPartsCardFiltersInput>>>;
  pattern?: InputMaybe<BooleanFilterInput>;
  text?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  tone?: InputMaybe<StringFilterInput>;
};

export type ComponentPartsCollectionCard = {
  __typename?: 'ComponentPartsCollectionCard';
  collection: Maybe<CarCollection>;
  id: Scalars['ID']['output'];
  link: ComponentPartsLink;
};

export type ComponentPartsCollectionCardFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentPartsCollectionCardFiltersInput>>>;
  collection?: InputMaybe<CarCollectionFiltersInput>;
  link?: InputMaybe<ComponentPartsLinkFiltersInput>;
  not?: InputMaybe<ComponentPartsCollectionCardFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentPartsCollectionCardFiltersInput>>>;
};

export type ComponentPartsCta = {
  __typename?: 'ComponentPartsCta';
  icon: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  link: ComponentPartsLink;
  variant: Enum_Componentpartscta_Variant;
};

export type ComponentPartsCtaFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentPartsCtaFiltersInput>>>;
  icon?: InputMaybe<StringFilterInput>;
  link?: InputMaybe<ComponentPartsLinkFiltersInput>;
  not?: InputMaybe<ComponentPartsCtaFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentPartsCtaFiltersInput>>>;
  variant?: InputMaybe<StringFilterInput>;
};

export type ComponentPartsFaqGroup = {
  __typename?: 'ComponentPartsFaqGroup';
  icon: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  items: Array<Maybe<ComponentPartsFaqItem>>;
  title: Maybe<Scalars['String']['output']>;
};


export type ComponentPartsFaqGroupItemsArgs = {
  filters: InputMaybe<ComponentPartsFaqItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentPartsFaqGroupFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentPartsFaqGroupFiltersInput>>>;
  icon?: InputMaybe<StringFilterInput>;
  items?: InputMaybe<ComponentPartsFaqItemFiltersInput>;
  not?: InputMaybe<ComponentPartsFaqGroupFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentPartsFaqGroupFiltersInput>>>;
  title?: InputMaybe<StringFilterInput>;
};

export type ComponentPartsFaqItem = {
  __typename?: 'ComponentPartsFaqItem';
  answer: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  question: Scalars['String']['output'];
};

export type ComponentPartsFaqItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentPartsFaqItemFiltersInput>>>;
  answer?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentPartsFaqItemFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentPartsFaqItemFiltersInput>>>;
  question?: InputMaybe<StringFilterInput>;
};

export type ComponentPartsFeatureItem = {
  __typename?: 'ComponentPartsFeatureItem';
  icon: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  text: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type ComponentPartsFeatureItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentPartsFeatureItemFiltersInput>>>;
  icon?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentPartsFeatureItemFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentPartsFeatureItemFiltersInput>>>;
  text?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
};

export type ComponentPartsLink = {
  __typename?: 'ComponentPartsLink';
  blog: Maybe<Blog>;
  customUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label: Maybe<Scalars['String']['output']>;
  linkType: Enum_Componentpartslink_Linktype;
  localPage: Maybe<LocalPage>;
  newTab: Maybe<Scalars['Boolean']['output']>;
  page: Maybe<Page>;
  sale: Maybe<Sale>;
};

export type ComponentPartsLinkFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentPartsLinkFiltersInput>>>;
  blog?: InputMaybe<BlogFiltersInput>;
  customUrl?: InputMaybe<StringFilterInput>;
  label?: InputMaybe<StringFilterInput>;
  linkType?: InputMaybe<StringFilterInput>;
  localPage?: InputMaybe<LocalPageFiltersInput>;
  newTab?: InputMaybe<BooleanFilterInput>;
  not?: InputMaybe<ComponentPartsLinkFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentPartsLinkFiltersInput>>>;
  page?: InputMaybe<PageFiltersInput>;
  sale?: InputMaybe<SaleFiltersInput>;
};

export type ComponentSectionsBlog = {
  __typename?: 'ComponentSectionsBlog';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  headerAlign: Enum_Componentsectionsblog_Headeralign;
  id: Scalars['ID']['output'];
  layout: Enum_Componentsectionsblog_Layout;
  posts: Array<Maybe<Blog>>;
  posts_connection: Maybe<BlogRelationResponseCollection>;
  source: Enum_Componentsectionsblog_Source;
  spacing: Enum_Componentsectionsblog_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionsblog_Width;
};


export type ComponentSectionsBlogCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsBlogPostsArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsBlogPosts_ConnectionArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsCarClasses = {
  __typename?: 'ComponentSectionsCarClasses';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  categories: Maybe<Scalars['JSON']['output']>;
  collections: Maybe<Array<Maybe<ComponentPartsCollectionCard>>>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  headerAlign: Enum_Componentsectionscarclasses_Headeralign;
  id: Scalars['ID']['output'];
  layout: Enum_Componentsectionscarclasses_Layout;
  moreCard: Maybe<ComponentPartsCard>;
  source: Enum_Componentsectionscarclasses_Source;
  spacing: Enum_Componentsectionscarclasses_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionscarclasses_Width;
};


export type ComponentSectionsCarClassesCollectionsArgs = {
  filters: InputMaybe<ComponentPartsCollectionCardFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsCarClassesCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsCards = {
  __typename?: 'ComponentSectionsCards';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  cards: Array<Maybe<ComponentPartsCard>>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  display: Enum_Componentsectionscards_Display;
  headerAlign: Enum_Componentsectionscards_Headeralign;
  id: Scalars['ID']['output'];
  spacing: Enum_Componentsectionscards_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  visibleCards: Maybe<Scalars['Int']['output']>;
  width: Enum_Componentsectionscards_Width;
};


export type ComponentSectionsCardsCardsArgs = {
  filters: InputMaybe<ComponentPartsCardFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsCardsCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsCars = {
  __typename?: 'ComponentSectionsCars';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  carIds: Maybe<Scalars['JSON']['output']>;
  category: Maybe<Enum_Componentsectionscars_Category>;
  collection: Maybe<CarCollection>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  headerAlign: Enum_Componentsectionscars_Headeralign;
  id: Scalars['ID']['output'];
  layout: Enum_Componentsectionscars_Layout;
  limit: Maybe<Scalars['Int']['output']>;
  moreCard: Maybe<ComponentPartsCard>;
  segmentIds: Maybe<Scalars['JSON']['output']>;
  source: Enum_Componentsectionscars_Source;
  spacing: Enum_Componentsectionscars_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionscars_Width;
};


export type ComponentSectionsCarsCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsDivider = {
  __typename?: 'ComponentSectionsDivider';
  direction: Enum_Componentsectionsdivider_Direction;
  id: Scalars['ID']['output'];
  size: Enum_Componentsectionsdivider_Size;
  style: Enum_Componentsectionsdivider_Style;
  tone: Enum_Componentsectionsdivider_Tone;
};

export type ComponentSectionsExtras = {
  __typename?: 'ComponentSectionsExtras';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  group: Enum_Componentsectionsextras_Group;
  headerAlign: Enum_Componentsectionsextras_Headeralign;
  id: Scalars['ID']['output'];
  spacing: Enum_Componentsectionsextras_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionsextras_Width;
};


export type ComponentSectionsExtrasCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsFaq = {
  __typename?: 'ComponentSectionsFaq';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  groups: Array<Maybe<ComponentPartsFaqGroup>>;
  headerAlign: Enum_Componentsectionsfaq_Headeralign;
  id: Scalars['ID']['output'];
  search: Maybe<Scalars['Boolean']['output']>;
  spacing: Enum_Componentsectionsfaq_Spacing;
  structuredData: Maybe<Scalars['Boolean']['output']>;
  text: Maybe<Scalars['String']['output']>;
  textWidth: Enum_Componentsectionsfaq_Textwidth;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionsfaq_Width;
};


export type ComponentSectionsFaqCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsFaqGroupsArgs = {
  filters: InputMaybe<ComponentPartsFaqGroupFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsFeatures = {
  __typename?: 'ComponentSectionsFeatures';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  display: Enum_Componentsectionsfeatures_Display;
  headerAlign: Enum_Componentsectionsfeatures_Headeralign;
  id: Scalars['ID']['output'];
  items: Array<Maybe<ComponentPartsFeatureItem>>;
  spacing: Enum_Componentsectionsfeatures_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  variant: Enum_Componentsectionsfeatures_Variant;
  width: Enum_Componentsectionsfeatures_Width;
};


export type ComponentSectionsFeaturesCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsFeaturesItemsArgs = {
  filters: InputMaybe<ComponentPartsFeatureItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsForm = {
  __typename?: 'ComponentSectionsForm';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  formKind: Enum_Componentsectionsform_Formkind;
  formWidth: Enum_Componentsectionsform_Formwidth;
  headerAlign: Enum_Componentsectionsform_Headeralign;
  id: Scalars['ID']['output'];
  spacing: Enum_Componentsectionsform_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionsform_Width;
};

export type ComponentSectionsHero = {
  __typename?: 'ComponentSectionsHero';
  align: Maybe<Enum_Componentsectionshero_Align>;
  badge: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imageMobile: Maybe<UploadFile>;
  overlay: Enum_Componentsectionshero_Overlay;
  search: Enum_Componentsectionshero_Search;
  searchSide: Maybe<Enum_Componentsectionshero_Searchside>;
  searchTerm: Maybe<Enum_Componentsectionshero_Searchterm>;
  spacing: Enum_Componentsectionshero_Spacing;
  subtitle: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  video: Maybe<UploadFile>;
  videoMobile: Maybe<UploadFile>;
  width: Enum_Componentsectionshero_Width;
};


export type ComponentSectionsHeroCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsImage = {
  __typename?: 'ComponentSectionsImage';
  background: Maybe<ComponentPartsBackground>;
  caption: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image: UploadFile;
  imageMobile: Maybe<UploadFile>;
  size: Enum_Componentsectionsimage_Size;
  spacing: Enum_Componentsectionsimage_Spacing;
};

export type ComponentSectionsMap = {
  __typename?: 'ComponentSectionsMap';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  fullBleed: Maybe<Scalars['Boolean']['output']>;
  headerAlign: Enum_Componentsectionsmap_Headeralign;
  id: Scalars['ID']['output'];
  showLegend: Maybe<Scalars['Boolean']['output']>;
  showList: Maybe<Scalars['Boolean']['output']>;
  spacing: Enum_Componentsectionsmap_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionsmap_Width;
};


export type ComponentSectionsMapCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsReviews = {
  __typename?: 'ComponentSectionsReviews';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  headerAlign: Enum_Componentsectionsreviews_Headeralign;
  id: Scalars['ID']['output'];
  layout: Enum_Componentsectionsreviews_Layout;
  limit: Maybe<Scalars['Int']['output']>;
  ratings: Array<Maybe<Rating>>;
  ratings_connection: Maybe<RatingRelationResponseCollection>;
  score: Maybe<Scalars['Float']['output']>;
  scoreLabel: Maybe<Scalars['String']['output']>;
  showScore: Maybe<Scalars['Boolean']['output']>;
  source: Enum_Componentsectionsreviews_Source;
  spacing: Enum_Componentsectionsreviews_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionsreviews_Width;
};


export type ComponentSectionsReviewsCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsReviewsRatingsArgs = {
  filters: InputMaybe<RatingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsReviewsRatings_ConnectionArgs = {
  filters: InputMaybe<RatingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsSocial = {
  __typename?: 'ComponentSectionsSocial';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  layout: Enum_Componentsectionssocial_Layout;
  showContact: Maybe<Scalars['Boolean']['output']>;
  spacing: Enum_Componentsectionssocial_Spacing;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionssocial_Width;
};

export type ComponentSectionsSplit = {
  __typename?: 'ComponentSectionsSplit';
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  body: Maybe<Scalars['String']['output']>;
  content: Enum_Componentsectionssplit_Content;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  faqs: Maybe<Array<Maybe<ComponentPartsFaqItem>>>;
  features: Maybe<Array<Maybe<ComponentPartsFeatureItem>>>;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imageFit: Enum_Componentsectionssplit_Imagefit;
  imageSecond: Maybe<UploadFile>;
  imageStyle: Enum_Componentsectionssplit_Imagestyle;
  media: Enum_Componentsectionssplit_Media;
  mediaSide: Enum_Componentsectionssplit_Mediaside;
  showLegend: Maybe<Scalars['Boolean']['output']>;
  spacing: Enum_Componentsectionssplit_Spacing;
  statLabel: Maybe<Scalars['String']['output']>;
  statValue: Maybe<Scalars['String']['output']>;
  structuredData: Maybe<Scalars['Boolean']['output']>;
  text: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionssplit_Width;
};


export type ComponentSectionsSplitCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsSplitFaqsArgs = {
  filters: InputMaybe<ComponentPartsFaqItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSectionsSplitFeaturesArgs = {
  filters: InputMaybe<ComponentPartsFeatureItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsText = {
  __typename?: 'ComponentSectionsText';
  align: Enum_Componentsectionstext_Align;
  background: Maybe<ComponentPartsBackground>;
  badge: Maybe<Scalars['String']['output']>;
  body: Maybe<Scalars['String']['output']>;
  collapsible: Maybe<Scalars['Boolean']['output']>;
  ctas: Maybe<Array<Maybe<ComponentPartsCta>>>;
  id: Scalars['ID']['output'];
  previewParagraphs: Maybe<Scalars['Int']['output']>;
  spacing: Enum_Componentsectionstext_Spacing;
  textWidth: Enum_Componentsectionstext_Textwidth;
  title: Maybe<Scalars['String']['output']>;
  width: Enum_Componentsectionstext_Width;
};


export type ComponentSectionsTextCtasArgs = {
  filters: InputMaybe<ComponentPartsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSectionsVariantLabel = {
  __typename?: 'ComponentSectionsVariantLabel';
  id: Scalars['ID']['output'];
  note: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type ComponentSharedBasicText = {
  __typename?: 'ComponentSharedBasicText';
  id: Scalars['ID']['output'];
  richText: Maybe<Scalars['String']['output']>;
};

export type ComponentSharedBlogShow = {
  __typename?: 'ComponentSharedBlogShow';
  asSlider: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  limit: Scalars['Int']['output'];
};

export type ComponentSharedBoxes = {
  __typename?: 'ComponentSharedBoxes';
  asSlider: Scalars['Boolean']['output'];
  boxes: Maybe<Array<Maybe<ComponentSharedPromoBox>>>;
  id: Scalars['ID']['output'];
};


export type ComponentSharedBoxesBoxesArgs = {
  filters: InputMaybe<ComponentSharedPromoBoxFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedButtons = {
  __typename?: 'ComponentSharedButtons';
  id: Scalars['ID']['output'];
  links: Maybe<Array<Maybe<ComponentSharedCta>>>;
};


export type ComponentSharedButtonsLinksArgs = {
  filters: InputMaybe<ComponentSharedCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedCard = {
  __typename?: 'ComponentSharedCard';
  id: Scalars['ID']['output'];
  image: UploadFile;
  text: Maybe<Scalars['JSON']['output']>;
  title: Scalars['String']['output'];
};

export type ComponentSharedCardFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSharedCardFiltersInput>>>;
  not?: InputMaybe<ComponentSharedCardFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSharedCardFiltersInput>>>;
  text?: InputMaybe<JsonFilterInput>;
  title?: InputMaybe<StringFilterInput>;
};

export type ComponentSharedCardGroup = {
  __typename?: 'ComponentSharedCardGroup';
  cards: Array<Maybe<ComponentSharedCard>>;
  id: Scalars['ID']['output'];
};


export type ComponentSharedCardGroupCardsArgs = {
  filters: InputMaybe<ComponentSharedCardFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedCarsShow = {
  __typename?: 'ComponentSharedCarsShow';
  asBox: Scalars['Boolean']['output'];
  asSlider: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  limit: Scalars['Int']['output'];
};

export type ComponentSharedContact = {
  __typename?: 'ComponentSharedContact';
  id: Scalars['ID']['output'];
  showData: Scalars['Boolean']['output'];
  text: Maybe<Scalars['JSON']['output']>;
};

export type ComponentSharedCta = {
  __typename?: 'ComponentSharedCta';
  color: Enum_Componentsharedcta_Color;
  id: Scalars['ID']['output'];
  link: Maybe<ComponentSharedLink>;
  type: Enum_Componentsharedcta_Type;
};

export type ComponentSharedCtaFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSharedCtaFiltersInput>>>;
  color?: InputMaybe<StringFilterInput>;
  link?: InputMaybe<ComponentSharedLinkFiltersInput>;
  not?: InputMaybe<ComponentSharedCtaFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSharedCtaFiltersInput>>>;
  type?: InputMaybe<StringFilterInput>;
};

export type ComponentSharedDivider = {
  __typename?: 'ComponentSharedDivider';
  hasLine: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isHuge: Scalars['Boolean']['output'];
};

export type ComponentSharedFaq = {
  __typename?: 'ComponentSharedFaq';
  id: Scalars['ID']['output'];
  items: Maybe<Array<Maybe<ComponentSharedFaqItem>>>;
};


export type ComponentSharedFaqItemsArgs = {
  filters: InputMaybe<ComponentSharedFaqItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedFaqItem = {
  __typename?: 'ComponentSharedFaqItem';
  answer: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  question: Scalars['String']['output'];
};

export type ComponentSharedFaqItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSharedFaqItemFiltersInput>>>;
  answer?: InputMaybe<JsonFilterInput>;
  not?: InputMaybe<ComponentSharedFaqItemFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSharedFaqItemFiltersInput>>>;
  question?: InputMaybe<StringFilterInput>;
};

export type ComponentSharedHero = {
  __typename?: 'ComponentSharedHero';
  badge: Maybe<Scalars['String']['output']>;
  bgImage: UploadFile;
  bgVideo: Maybe<UploadFile>;
  id: Scalars['ID']['output'];
  links: Maybe<Array<Maybe<ComponentSharedCta>>>;
  subtitle: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};


export type ComponentSharedHeroLinksArgs = {
  filters: InputMaybe<ComponentSharedCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedHeroFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSharedHeroFiltersInput>>>;
  badge?: InputMaybe<StringFilterInput>;
  links?: InputMaybe<ComponentSharedCtaFiltersInput>;
  not?: InputMaybe<ComponentSharedHeroFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSharedHeroFiltersInput>>>;
  subtitle?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
};

export type ComponentSharedHeroPage = {
  __typename?: 'ComponentSharedHeroPage';
  hero: Array<Maybe<ComponentSharedHero>>;
  id: Scalars['ID']['output'];
  isFullscreen: Scalars['Boolean']['output'];
  showCalendar: Scalars['Boolean']['output'];
  showLongTermAsDefault: Scalars['Boolean']['output'];
};


export type ComponentSharedHeroPageHeroArgs = {
  filters: InputMaybe<ComponentSharedHeroFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedImage = {
  __typename?: 'ComponentSharedImage';
  caption: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image: UploadFile;
};

export type ComponentSharedLink = {
  __typename?: 'ComponentSharedLink';
  blog: Maybe<Blog>;
  id: Scalars['ID']['output'];
  newTab: Maybe<Scalars['Boolean']['output']>;
  page: Maybe<Page>;
  title: Maybe<Scalars['String']['output']>;
  url: Maybe<Scalars['String']['output']>;
};

export type ComponentSharedLinkFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSharedLinkFiltersInput>>>;
  blog?: InputMaybe<BlogFiltersInput>;
  newTab?: InputMaybe<BooleanFilterInput>;
  not?: InputMaybe<ComponentSharedLinkFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSharedLinkFiltersInput>>>;
  page?: InputMaybe<PageFiltersInput>;
  title?: InputMaybe<StringFilterInput>;
  url?: InputMaybe<StringFilterInput>;
};

export type ComponentSharedLinkGroup = {
  __typename?: 'ComponentSharedLinkGroup';
  id: Scalars['ID']['output'];
  links: Maybe<Array<Maybe<ComponentSharedLink>>>;
  title: Scalars['String']['output'];
};


export type ComponentSharedLinkGroupLinksArgs = {
  filters: InputMaybe<ComponentSharedLinkFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedLinkInput = {
  blog?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  newTab?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['ID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type ComponentSharedMap = {
  __typename?: 'ComponentSharedMap';
  fullScreen: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
};

export type ComponentSharedOpinions = {
  __typename?: 'ComponentSharedOpinions';
  id: Scalars['ID']['output'];
  items: Scalars['Int']['output'];
};

export type ComponentSharedPointDetails = {
  __typename?: 'ComponentSharedPointDetails';
  id: Scalars['ID']['output'];
  isAirport: Maybe<Scalars['Boolean']['output']>;
  isPointPage: Scalars['Boolean']['output'];
  pointId: Maybe<Scalars['String']['output']>;
};

export type ComponentSharedPromoBox = {
  __typename?: 'ComponentSharedPromoBox';
  id: Scalars['ID']['output'];
  image: UploadFile;
  link: Maybe<ComponentSharedCta>;
  subtitle: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ComponentSharedPromoBoxFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSharedPromoBoxFiltersInput>>>;
  link?: InputMaybe<ComponentSharedCtaFiltersInput>;
  not?: InputMaybe<ComponentSharedPromoBoxFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSharedPromoBoxFiltersInput>>>;
  subtitle?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
};

export type ComponentSharedPromoShow = {
  __typename?: 'ComponentSharedPromoShow';
  id: Scalars['ID']['output'];
  isFuture: Maybe<Scalars['Boolean']['output']>;
};

export type ComponentSharedReservationCalc = {
  __typename?: 'ComponentSharedReservationCalc';
  id: Scalars['ID']['output'];
  showCalc: Scalars['Boolean']['output'];
};

export type ComponentSharedSeo = {
  __typename?: 'ComponentSharedSeo';
  id: Scalars['ID']['output'];
  metaDescription: Maybe<Scalars['String']['output']>;
  metaKewords: Maybe<Scalars['String']['output']>;
  metaTitle: Scalars['String']['output'];
  noFollow: Maybe<Scalars['Boolean']['output']>;
  noIndex: Maybe<Scalars['Boolean']['output']>;
  shareImage: Maybe<UploadFile>;
};

export type ComponentSharedSeoFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSharedSeoFiltersInput>>>;
  metaDescription?: InputMaybe<StringFilterInput>;
  metaKewords?: InputMaybe<StringFilterInput>;
  metaTitle?: InputMaybe<StringFilterInput>;
  noFollow?: InputMaybe<BooleanFilterInput>;
  noIndex?: InputMaybe<BooleanFilterInput>;
  not?: InputMaybe<ComponentSharedSeoFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSharedSeoFiltersInput>>>;
};

export type ComponentSharedSeoInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaKewords?: InputMaybe<Scalars['String']['input']>;
  metaTitle?: InputMaybe<Scalars['String']['input']>;
  noFollow?: InputMaybe<Scalars['Boolean']['input']>;
  noIndex?: InputMaybe<Scalars['Boolean']['input']>;
  shareImage?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentSharedSocialMedia = {
  __typename?: 'ComponentSharedSocialMedia';
  id: Scalars['ID']['output'];
  isWhite: Scalars['Boolean']['output'];
};

export type ComponentSharedSocialUrl = {
  __typename?: 'ComponentSharedSocialUrl';
  id: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

export type ComponentSharedSocialUrlFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSharedSocialUrlFiltersInput>>>;
  not?: InputMaybe<ComponentSharedSocialUrlFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSharedSocialUrlFiltersInput>>>;
  url?: InputMaybe<StringFilterInput>;
};

export type ComponentSharedSocialUrlInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type ComponentSharedText = {
  __typename?: 'ComponentSharedText';
  alignment: Maybe<Enum_Componentsharedtext_Alignment>;
  id: Scalars['ID']['output'];
  richText: Maybe<Scalars['JSON']['output']>;
};

export type ComponentSharedTextHeading = {
  __typename?: 'ComponentSharedTextHeading';
  displayAs: Enum_Componentsharedtextheading_Displayas;
  id: Scalars['ID']['output'];
  lead: Maybe<Scalars['JSON']['output']>;
  link: Maybe<ComponentSharedCta>;
  title: Scalars['String']['output'];
};

export type ComponentSharedTextWithImage = {
  __typename?: 'ComponentSharedTextWithImage';
  bgColor: Enum_Componentsharedtextwithimage_Bgcolor;
  id: Scalars['ID']['output'];
  image: Maybe<UploadFile>;
  imagePosition: Enum_Componentsharedtextwithimage_Imageposition;
  links: Maybe<Array<Maybe<ComponentSharedCta>>>;
  text: Maybe<Scalars['JSON']['output']>;
  title: Scalars['String']['output'];
};


export type ComponentSharedTextWithImageLinksArgs = {
  filters: InputMaybe<ComponentSharedCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSiteContact = {
  __typename?: 'ComponentSiteContact';
  address: Maybe<Scalars['String']['output']>;
  availabilityNote: Maybe<Scalars['String']['output']>;
  chatUrl: Maybe<Scalars['String']['output']>;
  departments: Maybe<Array<Maybe<ComponentElementsDepartment>>>;
  email: Scalars['String']['output'];
  hours: Maybe<Array<Maybe<ComponentElementsOpeningHours>>>;
  id: Scalars['ID']['output'];
  krs: Maybe<Scalars['String']['output']>;
  legalName: Maybe<Scalars['String']['output']>;
  mapUrl: Maybe<Scalars['String']['output']>;
  nip: Maybe<Scalars['String']['output']>;
  openingHours: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  regon: Maybe<Scalars['String']['output']>;
  whatsapp: Maybe<Scalars['String']['output']>;
};


export type ComponentSiteContactDepartmentsArgs = {
  filters: InputMaybe<ComponentElementsDepartmentFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentSiteContactHoursArgs = {
  filters: InputMaybe<ComponentElementsOpeningHoursFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSiteContactInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  availabilityNote?: InputMaybe<Scalars['String']['input']>;
  chatUrl?: InputMaybe<Scalars['String']['input']>;
  departments?: InputMaybe<Array<InputMaybe<ComponentElementsDepartmentInput>>>;
  email?: InputMaybe<Scalars['String']['input']>;
  hours?: InputMaybe<Array<InputMaybe<ComponentElementsOpeningHoursInput>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  krs?: InputMaybe<Scalars['String']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  mapUrl?: InputMaybe<Scalars['String']['input']>;
  nip?: InputMaybe<Scalars['String']['input']>;
  openingHours?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  regon?: InputMaybe<Scalars['String']['input']>;
  whatsapp?: InputMaybe<Scalars['String']['input']>;
};

export type ComponentSitePaymentMethod = {
  __typename?: 'ComponentSitePaymentMethod';
  id: Scalars['ID']['output'];
  method: Enum_Componentsitepaymentmethod_Method;
};

export type ComponentSitePaymentMethodFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSitePaymentMethodFiltersInput>>>;
  method?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentSitePaymentMethodFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSitePaymentMethodFiltersInput>>>;
};

export type ComponentSitePaymentMethodInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  method?: InputMaybe<Enum_Componentsitepaymentmethod_Method>;
};

export type ComponentSiteSocialLink = {
  __typename?: 'ComponentSiteSocialLink';
  id: Scalars['ID']['output'];
  platform: Enum_Componentsitesociallink_Platform;
  url: Scalars['String']['output'];
};

export type ComponentSiteSocialLinkFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentSiteSocialLinkFiltersInput>>>;
  not?: InputMaybe<ComponentSiteSocialLinkFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSiteSocialLinkFiltersInput>>>;
  platform?: InputMaybe<StringFilterInput>;
  url?: InputMaybe<StringFilterInput>;
};

export type ComponentSiteSocialLinkInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  platform?: InputMaybe<Enum_Componentsitesociallink_Platform>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type ComponentSystemDictionary = {
  __typename?: 'ComponentSystemDictionary';
  Key: Scalars['String']['output'];
  Name: Scalars['String']['output'];
  Value: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type ComponentSystemDictionaryFiltersInput = {
  Key?: InputMaybe<StringFilterInput>;
  Name?: InputMaybe<StringFilterInput>;
  Value?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<ComponentSystemDictionaryFiltersInput>>>;
  not?: InputMaybe<ComponentSystemDictionaryFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentSystemDictionaryFiltersInput>>>;
};

export type ComponentSystemDictionaryInput = {
  Key?: InputMaybe<Scalars['String']['input']>;
  Name?: InputMaybe<Scalars['String']['input']>;
  Value?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentSystemRedirects = {
  __typename?: 'ComponentSystemRedirects';
  from: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  to: Scalars['String']['output'];
};

export type DateFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  contains?: InputMaybe<Scalars['Date']['input']>;
  containsi?: InputMaybe<Scalars['Date']['input']>;
  endsWith?: InputMaybe<Scalars['Date']['input']>;
  eq?: InputMaybe<Scalars['Date']['input']>;
  eqi?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  ne?: InputMaybe<Scalars['Date']['input']>;
  nei?: InputMaybe<Scalars['Date']['input']>;
  not?: InputMaybe<DateFilterInput>;
  notContains?: InputMaybe<Scalars['Date']['input']>;
  notContainsi?: InputMaybe<Scalars['Date']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  startsWith?: InputMaybe<Scalars['Date']['input']>;
};

export type DateTimeFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  contains?: InputMaybe<Scalars['DateTime']['input']>;
  containsi?: InputMaybe<Scalars['DateTime']['input']>;
  endsWith?: InputMaybe<Scalars['DateTime']['input']>;
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  eqi?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  ne?: InputMaybe<Scalars['DateTime']['input']>;
  nei?: InputMaybe<Scalars['DateTime']['input']>;
  not?: InputMaybe<DateTimeFilterInput>;
  notContains?: InputMaybe<Scalars['DateTime']['input']>;
  notContainsi?: InputMaybe<Scalars['DateTime']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  startsWith?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DeleteMutationResponse = {
  __typename?: 'DeleteMutationResponse';
  documentId: Scalars['ID']['output'];
};

export type Dictionary = {
  __typename?: 'Dictionary';
  Item: Maybe<Array<Maybe<ComponentSystemDictionary>>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Dictionary>>;
  localizations_connection: Maybe<DictionaryRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type DictionaryItemArgs = {
  filters: InputMaybe<ComponentSystemDictionaryFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type DictionaryInput = {
  Item?: InputMaybe<Array<InputMaybe<ComponentSystemDictionaryInput>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DictionaryRelationResponseCollection = {
  __typename?: 'DictionaryRelationResponseCollection';
  nodes: Array<Dictionary>;
};

export type Enum_Announcement_Variant =
  | 'info'
  | 'promo'
  | 'urgent';

export type Enum_Blogcategory_Color =
  | 'blue'
  | 'green'
  | 'navy'
  | 'sand';

export type Enum_Carcollection_Sort =
  | 'default'
  | 'popular'
  | 'price';

export type Enum_City_Kind =
  | 'airport'
  | 'city';

export type Enum_Componentblocksblogposts_Source =
  | 'latest'
  | 'picked';

export type Enum_Componentblockscars_Category =
  | 'automatic'
  | 'delivery'
  | 'electric'
  | 'family';

export type Enum_Componentblockscars_Defaultcategory =
  | 'all'
  | 'compact'
  | 'delivery'
  | 'eco'
  | 'large'
  | 'seats7'
  | 'small';

export type Enum_Componentblockscars_Layout =
  | 'catalog'
  | 'categories'
  | 'grid'
  | 'row'
  | 'tabs';

export type Enum_Componentblockscars_Source =
  | 'all'
  | 'category'
  | 'classes';

export type Enum_Componentblockscontent_Align =
  | 'center'
  | 'start';

export type Enum_Componentblocksctaband_Tone =
  | 'dark'
  | 'tint';

export type Enum_Componentblocksctaband_Variant =
  | 'band'
  | 'photo';

export type Enum_Componentblocksfeatures_Variant =
  | 'benefits'
  | 'cards'
  | 'circles'
  | 'overlay'
  | 'photo'
  | 'plain'
  | 'steps';

export type Enum_Componentblockshero_Focalpoint =
  | 'center'
  | 'left'
  | 'right';

export type Enum_Componentblockshero_Height =
  | 'compact'
  | 'default'
  | 'fullscreen';

export type Enum_Componentblockshero_Layout =
  | 'cover'
  | 'page'
  | 'split';

export type Enum_Componentblockshero_Overlay =
  | 'light'
  | 'medium'
  | 'none'
  | 'strong';

export type Enum_Componentblockshero_Reservationdefaultterm =
  | 'longTerm'
  | 'shortTerm';

export type Enum_Componentblockshero_Reservationlayout =
  | 'default'
  | 'horizontal'
  | 'none';

export type Enum_Componentblockshero_Searchside =
  | 'end'
  | 'start';

export type Enum_Componentblocksleadform_Variant =
  | 'business'
  | 'contact';

export type Enum_Componentblockslocations_Filter =
  | 'airports'
  | 'all'
  | 'city';

export type Enum_Componentblockslocations_Layout =
  | 'compact'
  | 'full'
  | 'map';

export type Enum_Componentblocksmediatext_Imageposition =
  | 'end'
  | 'start';

export type Enum_Componentblocksmediatext_Imagestyle =
  | 'cutout'
  | 'rounded';

export type Enum_Componentblocksreviews_Layout =
  | 'cards'
  | 'spotlight';

export type Enum_Componentblocksreviews_Source =
  | 'all'
  | 'facebook'
  | 'google';

export type Enum_Componentblocksscenarios_Layout =
  | 'panel'
  | 'tabs';

export type Enum_Componentblockstrustbar_Variant =
  | 'inline'
  | 'strip';

export type Enum_Componentelementscomparisonvalue_Kind =
  | 'no'
  | 'partial'
  | 'text'
  | 'yes';

export type Enum_Componentelementscta_Variant =
  | 'primary'
  | 'secondary'
  | 'success';

export type Enum_Componentelementsfeature_Tone =
  | 'brand'
  | 'go'
  | 'photo'
  | 'studio';

export type Enum_Componentelementslink_Linktype =
  | 'blog'
  | 'customUrl'
  | 'localPage'
  | 'page'
  | 'sale';

export type Enum_Componentelementspromo_Tone =
  | 'brand'
  | 'go'
  | 'photo';

export type Enum_Componentelementssection_Background =
  | 'brand'
  | 'none'
  | 'photo'
  | 'wash';

export type Enum_Componentelementssection_Ornament =
  | 'contour'
  | 'grid'
  | 'none'
  | 'road';

export type Enum_Componentelementssection_Spacing =
  | 'compact'
  | 'default'
  | 'none';

export type Enum_Componentelementssection_Tone =
  | 'canvas'
  | 'dark'
  | 'surface'
  | 'tint';

export type Enum_Componentelementssection_Width =
  | 'full'
  | 'page'
  | 'reading';

export type Enum_Componentelementssettings_Containerwidth =
  | 'default'
  | 'full'
  | 'narrow'
  | 'wide';

export type Enum_Componentelementssettings_Spacingbottom =
  | 'default'
  | 'large'
  | 'none'
  | 'small';

export type Enum_Componentelementssettings_Spacingtop =
  | 'default'
  | 'large'
  | 'none'
  | 'small';

export type Enum_Componentelementssettings_Theme =
  | 'dark'
  | 'gray'
  | 'light'
  | 'primary';

export type Enum_Componentelementsstatref_Kind =
  | 'airports'
  | 'cities'
  | 'points';

export type Enum_Componentmenuitem_Submenu =
  | 'blog'
  | 'fleet'
  | 'links'
  | 'locations'
  | 'none';

export type Enum_Componentpartsbackground_Tone =
  | 'blue'
  | 'fade'
  | 'green'
  | 'image'
  | 'light'
  | 'navy'
  | 'white';

export type Enum_Componentpartscard_Tone =
  | 'blue'
  | 'green'
  | 'image'
  | 'navy';

export type Enum_Componentpartscta_Variant =
  | 'primary'
  | 'secondary'
  | 'success';

export type Enum_Componentpartslink_Linktype =
  | 'blog'
  | 'customUrl'
  | 'localPage'
  | 'page'
  | 'sale';

export type Enum_Componentsectionsblog_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionsblog_Layout =
  | 'featured'
  | 'grid';

export type Enum_Componentsectionsblog_Source =
  | 'all'
  | 'latest'
  | 'selected';

export type Enum_Componentsectionsblog_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsblog_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionscarclasses_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionscarclasses_Layout =
  | 'carousel'
  | 'grid';

export type Enum_Componentsectionscarclasses_Source =
  | 'classes'
  | 'collections';

export type Enum_Componentsectionscarclasses_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionscarclasses_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionscards_Display =
  | 'carousel'
  | 'grid';

export type Enum_Componentsectionscards_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionscards_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionscards_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionscars_Category =
  | 'delivery'
  | 'passenger'
  | 'popular';

export type Enum_Componentsectionscars_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionscars_Layout =
  | 'carousel'
  | 'full'
  | 'grid';

export type Enum_Componentsectionscars_Source =
  | 'all'
  | 'cars'
  | 'category'
  | 'classes'
  | 'collection';

export type Enum_Componentsectionscars_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionscars_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionsdivider_Direction =
  | 'left'
  | 'right';

export type Enum_Componentsectionsdivider_Size =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsdivider_Style =
  | 'blank'
  | 'lined'
  | 'slant';

export type Enum_Componentsectionsdivider_Tone =
  | 'blue'
  | 'green'
  | 'light'
  | 'navy'
  | 'white';

export type Enum_Componentsectionsextras_Group =
  | 'all'
  | 'border'
  | 'kids'
  | 'multimedia'
  | 'other'
  | 'protection';

export type Enum_Componentsectionsextras_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionsextras_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsextras_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionsfaq_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionsfaq_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsfaq_Textwidth =
  | 'narrow'
  | 'wide';

export type Enum_Componentsectionsfaq_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionsfeatures_Display =
  | 'carousel'
  | 'grid';

export type Enum_Componentsectionsfeatures_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionsfeatures_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsfeatures_Variant =
  | 'cards'
  | 'inline'
  | 'statements'
  | 'steps';

export type Enum_Componentsectionsfeatures_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionsform_Formkind =
  | 'contact';

export type Enum_Componentsectionsform_Formwidth =
  | 'narrow'
  | 'wide';

export type Enum_Componentsectionsform_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionsform_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsform_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionshero_Align =
  | 'center'
  | 'start';

export type Enum_Componentsectionshero_Overlay =
  | 'light'
  | 'none'
  | 'strong';

export type Enum_Componentsectionshero_Search =
  | 'horizontal'
  | 'none'
  | 'vertical';

export type Enum_Componentsectionshero_Searchside =
  | 'left'
  | 'right';

export type Enum_Componentsectionshero_Searchterm =
  | 'long'
  | 'short';

export type Enum_Componentsectionshero_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionshero_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionsimage_Size =
  | 'content'
  | 'narrow';

export type Enum_Componentsectionsimage_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsmap_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionsmap_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsmap_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionsreviews_Headeralign =
  | 'center'
  | 'start';

export type Enum_Componentsectionsreviews_Layout =
  | 'carousel'
  | 'spotlight';

export type Enum_Componentsectionsreviews_Source =
  | 'latest'
  | 'selected';

export type Enum_Componentsectionsreviews_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionsreviews_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionssocial_Layout =
  | 'centered'
  | 'split';

export type Enum_Componentsectionssocial_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionssocial_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionssplit_Content =
  | 'faq'
  | 'features'
  | 'form'
  | 'text';

export type Enum_Componentsectionssplit_Imagefit =
  | 'contain'
  | 'cover';

export type Enum_Componentsectionssplit_Imagestyle =
  | 'collage'
  | 'single';

export type Enum_Componentsectionssplit_Media =
  | 'image'
  | 'map';

export type Enum_Componentsectionssplit_Mediaside =
  | 'end'
  | 'start';

export type Enum_Componentsectionssplit_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionssplit_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsectionstext_Align =
  | 'center'
  | 'start';

export type Enum_Componentsectionstext_Spacing =
  | 'large'
  | 'medium'
  | 'small';

export type Enum_Componentsectionstext_Textwidth =
  | 'narrow'
  | 'wide';

export type Enum_Componentsectionstext_Width =
  | 'boxed'
  | 'contained'
  | 'full';

export type Enum_Componentsharedcta_Color =
  | 'blue'
  | 'green';

export type Enum_Componentsharedcta_Type =
  | 'bordered'
  | 'fill';

export type Enum_Componentsharedtextheading_Displayas =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';

export type Enum_Componentsharedtextwithimage_Bgcolor =
  | 'blue'
  | 'green'
  | 'white';

export type Enum_Componentsharedtextwithimage_Imageposition =
  | 'left'
  | 'right';

export type Enum_Componentsharedtext_Alignment =
  | 'center'
  | 'left'
  | 'right';

export type Enum_Componentsitepaymentmethod_Method =
  | 'applePay'
  | 'blik'
  | 'card'
  | 'googlePay'
  | 'tpay'
  | 'transfer'
  | 'viva';

export type Enum_Componentsitesociallink_Platform =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'x'
  | 'youtube';

export type Error = {
  __typename?: 'Error';
  code: Scalars['String']['output'];
  message: Maybe<Scalars['String']['output']>;
};

export type FaqCategory = {
  __typename?: 'FaqCategory';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  icon: Maybe<Scalars['String']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<FaqCategory>>;
  localizations_connection: Maybe<FaqCategoryRelationResponseCollection>;
  name: Scalars['String']['output'];
  order: Maybe<Scalars['Int']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type FaqCategoryLocalizationsArgs = {
  filters: InputMaybe<FaqCategoryFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type FaqCategoryLocalizations_ConnectionArgs = {
  filters: InputMaybe<FaqCategoryFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type FaqCategoryEntityResponseCollection = {
  __typename?: 'FaqCategoryEntityResponseCollection';
  nodes: Array<FaqCategory>;
  pageInfo: Pagination;
};

export type FaqCategoryFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<FaqCategoryFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  icon?: InputMaybe<StringFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<FaqCategoryFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<FaqCategoryFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<FaqCategoryFiltersInput>>>;
  order?: InputMaybe<IntFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type FaqCategoryInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type FaqCategoryRelationResponseCollection = {
  __typename?: 'FaqCategoryRelationResponseCollection';
  nodes: Array<FaqCategory>;
};

export type FileInfoInput = {
  alternativeText?: InputMaybe<Scalars['String']['input']>;
  caption?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type FloatFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  contains?: InputMaybe<Scalars['Float']['input']>;
  containsi?: InputMaybe<Scalars['Float']['input']>;
  endsWith?: InputMaybe<Scalars['Float']['input']>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  eqi?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  nei?: InputMaybe<Scalars['Float']['input']>;
  not?: InputMaybe<FloatFilterInput>;
  notContains?: InputMaybe<Scalars['Float']['input']>;
  notContainsi?: InputMaybe<Scalars['Float']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  startsWith?: InputMaybe<Scalars['Float']['input']>;
};

export type Footer = {
  __typename?: 'Footer';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  extraNavs: Maybe<Array<Maybe<FooterExtraNavsDynamicZone>>>;
  info: Maybe<Scalars['JSON']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Footer>>;
  localizations_connection: Maybe<FooterRelationResponseCollection>;
  nav: Maybe<Array<Maybe<FooterNavDynamicZone>>>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type FooterExtraNavsDynamicZone = ComponentSharedLinkGroup | Error;

export type FooterInput = {
  extraNavs?: InputMaybe<Array<Scalars['FooterExtraNavsDynamicZoneInput']['input']>>;
  info?: InputMaybe<Scalars['JSON']['input']>;
  nav?: InputMaybe<Array<Scalars['FooterNavDynamicZoneInput']['input']>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type FooterNavDynamicZone = ComponentSharedLinkGroup | Error;

export type FooterRelationResponseCollection = {
  __typename?: 'FooterRelationResponseCollection';
  nodes: Array<Footer>;
};

export type GenericMorph = Announcement | Blog | BlogCategory | CarCollection | City | ComponentBlocksBlogPosts | ComponentBlocksCars | ComponentBlocksComparison | ComponentBlocksContact | ComponentBlocksContent | ComponentBlocksCtaBand | ComponentBlocksFaq | ComponentBlocksFeatures | ComponentBlocksHero | ComponentBlocksLeadForm | ComponentBlocksLocations | ComponentBlocksLogos | ComponentBlocksMediaText | ComponentBlocksPromoCards | ComponentBlocksReviews | ComponentBlocksRichText | ComponentBlocksScenarios | ComponentBlocksTrustBar | ComponentElementsComparisonColumn | ComponentElementsComparisonRow | ComponentElementsComparisonValue | ComponentElementsCta | ComponentElementsDepartment | ComponentElementsFaqItem | ComponentElementsFeature | ComponentElementsHighlight | ComponentElementsLink | ComponentElementsListItem | ComponentElementsLogo | ComponentElementsOpeningHours | ComponentElementsPromo | ComponentElementsScenario | ComponentElementsSection | ComponentElementsSectionHeader | ComponentElementsSeo | ComponentElementsSettings | ComponentElementsStatRef | ComponentMenuGroup | ComponentMenuItem | ComponentPartsBackground | ComponentPartsCard | ComponentPartsCollectionCard | ComponentPartsCta | ComponentPartsFaqGroup | ComponentPartsFaqItem | ComponentPartsFeatureItem | ComponentPartsLink | ComponentSectionsBlog | ComponentSectionsCarClasses | ComponentSectionsCards | ComponentSectionsCars | ComponentSectionsDivider | ComponentSectionsExtras | ComponentSectionsFaq | ComponentSectionsFeatures | ComponentSectionsForm | ComponentSectionsHero | ComponentSectionsImage | ComponentSectionsMap | ComponentSectionsReviews | ComponentSectionsSocial | ComponentSectionsSplit | ComponentSectionsText | ComponentSectionsVariantLabel | ComponentSharedBasicText | ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCard | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedContact | ComponentSharedCta | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedFaqItem | ComponentSharedHero | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedLink | ComponentSharedLinkGroup | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPointDetails | ComponentSharedPromoBox | ComponentSharedPromoShow | ComponentSharedReservationCalc | ComponentSharedSeo | ComponentSharedSocialMedia | ComponentSharedSocialUrl | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | ComponentSiteContact | ComponentSitePaymentMethod | ComponentSiteSocialLink | ComponentSystemDictionary | ComponentSystemRedirects | Dictionary | FaqCategory | Footer | Global | I18NLocale | Infobar | Layout | LocalPage | Navigation | Page | Rating | Regulation | ReviewWorkflowsWorkflow | ReviewWorkflowsWorkflowStage | Sale | ServicePoint | Site | Social | UploadFile | UploadFolder | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser;

export type Global = {
  __typename?: 'Global';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  defaultSeo: Maybe<ComponentSharedSeo>;
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Global>>;
  localizations_connection: Maybe<GlobalRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type GlobalInput = {
  defaultSeo?: InputMaybe<ComponentSharedSeoInput>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type GlobalRelationResponseCollection = {
  __typename?: 'GlobalRelationResponseCollection';
  nodes: Array<Global>;
};

export type I18NLocale = {
  __typename?: 'I18NLocale';
  code: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type I18NLocaleEntityResponseCollection = {
  __typename?: 'I18NLocaleEntityResponseCollection';
  nodes: Array<I18NLocale>;
  pageInfo: Pagination;
};

export type I18NLocaleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  code?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<I18NLocaleFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type IdFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contains?: InputMaybe<Scalars['ID']['input']>;
  containsi?: InputMaybe<Scalars['ID']['input']>;
  endsWith?: InputMaybe<Scalars['ID']['input']>;
  eq?: InputMaybe<Scalars['ID']['input']>;
  eqi?: InputMaybe<Scalars['ID']['input']>;
  gt?: InputMaybe<Scalars['ID']['input']>;
  gte?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lt?: InputMaybe<Scalars['ID']['input']>;
  lte?: InputMaybe<Scalars['ID']['input']>;
  ne?: InputMaybe<Scalars['ID']['input']>;
  nei?: InputMaybe<Scalars['ID']['input']>;
  not?: InputMaybe<IdFilterInput>;
  notContains?: InputMaybe<Scalars['ID']['input']>;
  notContainsi?: InputMaybe<Scalars['ID']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startsWith?: InputMaybe<Scalars['ID']['input']>;
};

export type Infobar = {
  __typename?: 'Infobar';
  Information: Scalars['String']['output'];
  Link: Maybe<ComponentSharedLink>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  isActive: Maybe<Scalars['Boolean']['output']>;
  isUrgent: Maybe<Scalars['Boolean']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Infobar>>;
  localizations_connection: Maybe<InfobarRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type InfobarInput = {
  Information?: InputMaybe<Scalars['String']['input']>;
  Link?: InputMaybe<ComponentSharedLinkInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isUrgent?: InputMaybe<Scalars['Boolean']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type InfobarRelationResponseCollection = {
  __typename?: 'InfobarRelationResponseCollection';
  nodes: Array<Infobar>;
};

export type IntFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  contains?: InputMaybe<Scalars['Int']['input']>;
  containsi?: InputMaybe<Scalars['Int']['input']>;
  endsWith?: InputMaybe<Scalars['Int']['input']>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  eqi?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  nei?: InputMaybe<Scalars['Int']['input']>;
  not?: InputMaybe<IntFilterInput>;
  notContains?: InputMaybe<Scalars['Int']['input']>;
  notContainsi?: InputMaybe<Scalars['Int']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startsWith?: InputMaybe<Scalars['Int']['input']>;
};

export type JsonFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  contains?: InputMaybe<Scalars['JSON']['input']>;
  containsi?: InputMaybe<Scalars['JSON']['input']>;
  endsWith?: InputMaybe<Scalars['JSON']['input']>;
  eq?: InputMaybe<Scalars['JSON']['input']>;
  eqi?: InputMaybe<Scalars['JSON']['input']>;
  gt?: InputMaybe<Scalars['JSON']['input']>;
  gte?: InputMaybe<Scalars['JSON']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  lt?: InputMaybe<Scalars['JSON']['input']>;
  lte?: InputMaybe<Scalars['JSON']['input']>;
  ne?: InputMaybe<Scalars['JSON']['input']>;
  nei?: InputMaybe<Scalars['JSON']['input']>;
  not?: InputMaybe<JsonFilterInput>;
  notContains?: InputMaybe<Scalars['JSON']['input']>;
  notContainsi?: InputMaybe<Scalars['JSON']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  startsWith?: InputMaybe<Scalars['JSON']['input']>;
};

export type Layout = {
  __typename?: 'Layout';
  companyName: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  footerGroups: Maybe<Array<Maybe<ComponentMenuGroup>>>;
  footerText: Maybe<Scalars['String']['output']>;
  header: Maybe<Array<Maybe<ComponentMenuItem>>>;
  headerCta: Maybe<ComponentElementsLink>;
  legalLinks: Maybe<Array<Maybe<ComponentElementsLink>>>;
  legalText: Maybe<Scalars['String']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Layout>>;
  localizations_connection: Maybe<LayoutRelationResponseCollection>;
  paymentMethods: Maybe<Array<Maybe<ComponentSitePaymentMethod>>>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type LayoutFooterGroupsArgs = {
  filters: InputMaybe<ComponentMenuGroupFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type LayoutHeaderArgs = {
  filters: InputMaybe<ComponentMenuItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type LayoutLegalLinksArgs = {
  filters: InputMaybe<ComponentElementsLinkFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type LayoutPaymentMethodsArgs = {
  filters: InputMaybe<ComponentSitePaymentMethodFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type LayoutInput = {
  companyName?: InputMaybe<Scalars['String']['input']>;
  footerGroups?: InputMaybe<Array<InputMaybe<ComponentMenuGroupInput>>>;
  footerText?: InputMaybe<Scalars['String']['input']>;
  header?: InputMaybe<Array<InputMaybe<ComponentMenuItemInput>>>;
  headerCta?: InputMaybe<ComponentElementsLinkInput>;
  legalLinks?: InputMaybe<Array<InputMaybe<ComponentElementsLinkInput>>>;
  legalText?: InputMaybe<Scalars['String']['input']>;
  paymentMethods?: InputMaybe<Array<InputMaybe<ComponentSitePaymentMethodInput>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type LayoutRelationResponseCollection = {
  __typename?: 'LayoutRelationResponseCollection';
  nodes: Array<Layout>;
};

export type LocalPage = {
  __typename?: 'LocalPage';
  Title: Scalars['String']['output'];
  blocks: Maybe<Array<Maybe<LocalPageBlocksDynamicZone>>>;
  components: Maybe<Array<Maybe<LocalPageComponentsDynamicZone>>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<LocalPage>>;
  localizations_connection: Maybe<LocalPageRelationResponseCollection>;
  pickupPoint: Maybe<Scalars['Int']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  seo: Maybe<ComponentSharedSeo>;
  shortName: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type LocalPageLocalizationsArgs = {
  filters: InputMaybe<LocalPageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type LocalPageLocalizations_ConnectionArgs = {
  filters: InputMaybe<LocalPageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type LocalPageBlocksDynamicZone = ComponentBlocksBlogPosts | ComponentBlocksCars | ComponentBlocksComparison | ComponentBlocksContact | ComponentBlocksContent | ComponentBlocksCtaBand | ComponentBlocksFaq | ComponentBlocksFeatures | ComponentBlocksHero | ComponentBlocksLeadForm | ComponentBlocksLocations | ComponentBlocksLogos | ComponentBlocksMediaText | ComponentBlocksPromoCards | ComponentBlocksReviews | ComponentBlocksScenarios | ComponentBlocksTrustBar | Error;

export type LocalPageComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPromoShow | ComponentSharedReservationCalc | ComponentSharedSocialMedia | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type LocalPageEntityResponseCollection = {
  __typename?: 'LocalPageEntityResponseCollection';
  nodes: Array<LocalPage>;
  pageInfo: Pagination;
};

export type LocalPageFiltersInput = {
  Title?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<LocalPageFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<LocalPageFiltersInput>;
  not?: InputMaybe<LocalPageFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<LocalPageFiltersInput>>>;
  pickupPoint?: InputMaybe<IntFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  seo?: InputMaybe<ComponentSharedSeoFiltersInput>;
  shortName?: InputMaybe<StringFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type LocalPageInput = {
  Title?: InputMaybe<Scalars['String']['input']>;
  blocks?: InputMaybe<Array<Scalars['LocalPageBlocksDynamicZoneInput']['input']>>;
  components?: InputMaybe<Array<Scalars['LocalPageComponentsDynamicZoneInput']['input']>>;
  pickupPoint?: InputMaybe<Scalars['Int']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  seo?: InputMaybe<ComponentSharedSeoInput>;
  shortName?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type LocalPageRelationResponseCollection = {
  __typename?: 'LocalPageRelationResponseCollection';
  nodes: Array<LocalPage>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Change user password. Confirm with the current password. */
  changePassword: Maybe<UsersPermissionsLoginPayload>;
  createBlog: Maybe<Blog>;
  createBlogCategory: Maybe<BlogCategory>;
  createCarCollection: Maybe<CarCollection>;
  createCity: Maybe<City>;
  createFaqCategory: Maybe<FaqCategory>;
  createLocalPage: Maybe<LocalPage>;
  createPage: Maybe<Page>;
  createRating: Maybe<Rating>;
  createRegulation: Maybe<Regulation>;
  createReviewWorkflowsWorkflow: Maybe<ReviewWorkflowsWorkflow>;
  createReviewWorkflowsWorkflowStage: Maybe<ReviewWorkflowsWorkflowStage>;
  createSale: Maybe<Sale>;
  createServicePoint: Maybe<ServicePoint>;
  /** Create a new role */
  createUsersPermissionsRole: Maybe<UsersPermissionsCreateRolePayload>;
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  deleteAnnouncement: Maybe<DeleteMutationResponse>;
  deleteBlog: Maybe<DeleteMutationResponse>;
  deleteBlogCategory: Maybe<DeleteMutationResponse>;
  deleteCarCollection: Maybe<DeleteMutationResponse>;
  deleteCity: Maybe<DeleteMutationResponse>;
  deleteDictionary: Maybe<DeleteMutationResponse>;
  deleteFaqCategory: Maybe<DeleteMutationResponse>;
  deleteFooter: Maybe<DeleteMutationResponse>;
  deleteGlobal: Maybe<DeleteMutationResponse>;
  deleteInfobar: Maybe<DeleteMutationResponse>;
  deleteLayout: Maybe<DeleteMutationResponse>;
  deleteLocalPage: Maybe<DeleteMutationResponse>;
  deleteNavigation: Maybe<DeleteMutationResponse>;
  deletePage: Maybe<DeleteMutationResponse>;
  deleteRating: Maybe<DeleteMutationResponse>;
  deleteRegulation: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflow: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflowStage: Maybe<DeleteMutationResponse>;
  deleteSale: Maybe<DeleteMutationResponse>;
  deleteServicePoint: Maybe<DeleteMutationResponse>;
  deleteSite: Maybe<DeleteMutationResponse>;
  deleteSocial: Maybe<DeleteMutationResponse>;
  deleteUploadFile: Maybe<UploadFile>;
  /** Delete an existing role */
  deleteUsersPermissionsRole: Maybe<UsersPermissionsDeleteRolePayload>;
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  /** Confirm an email users email address */
  emailConfirmation: Maybe<UsersPermissionsLoginPayload>;
  /** Request a reset password token */
  forgotPassword: Maybe<UsersPermissionsPasswordPayload>;
  login: UsersPermissionsLoginPayload;
  /** Register a user */
  register: UsersPermissionsLoginPayload;
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword: Maybe<UsersPermissionsLoginPayload>;
  updateAnnouncement: Maybe<Announcement>;
  updateBlog: Maybe<Blog>;
  updateBlogCategory: Maybe<BlogCategory>;
  updateCarCollection: Maybe<CarCollection>;
  updateCity: Maybe<City>;
  updateDictionary: Maybe<Dictionary>;
  updateFaqCategory: Maybe<FaqCategory>;
  updateFooter: Maybe<Footer>;
  updateGlobal: Maybe<Global>;
  updateInfobar: Maybe<Infobar>;
  updateLayout: Maybe<Layout>;
  updateLocalPage: Maybe<LocalPage>;
  updateNavigation: Maybe<Navigation>;
  updatePage: Maybe<Page>;
  updateRating: Maybe<Rating>;
  updateRegulation: Maybe<Regulation>;
  updateReviewWorkflowsWorkflow: Maybe<ReviewWorkflowsWorkflow>;
  updateReviewWorkflowsWorkflowStage: Maybe<ReviewWorkflowsWorkflowStage>;
  updateSale: Maybe<Sale>;
  updateServicePoint: Maybe<ServicePoint>;
  updateSite: Maybe<Site>;
  updateSocial: Maybe<Social>;
  updateUploadFile: UploadFile;
  /** Update an existing role */
  updateUsersPermissionsRole: Maybe<UsersPermissionsUpdateRolePayload>;
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse;
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};


export type MutationCreateBlogArgs = {
  data: BlogInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateBlogCategoryArgs = {
  data: BlogCategoryInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateCarCollectionArgs = {
  data: CarCollectionInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateCityArgs = {
  data: CityInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateFaqCategoryArgs = {
  data: FaqCategoryInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateLocalPageArgs = {
  data: LocalPageInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreatePageArgs = {
  data: PageInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateRatingArgs = {
  data: RatingInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateRegulationArgs = {
  data: RegulationInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateReviewWorkflowsWorkflowArgs = {
  data: ReviewWorkflowsWorkflowInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateReviewWorkflowsWorkflowStageArgs = {
  data: ReviewWorkflowsWorkflowStageInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateSaleArgs = {
  data: SaleInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateServicePointArgs = {
  data: ServicePointInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
};


export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
};


export type MutationDeleteAnnouncementArgs = {
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteBlogArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteBlogCategoryArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteCarCollectionArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteCityArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteDictionaryArgs = {
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteFaqCategoryArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteFooterArgs = {
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteGlobalArgs = {
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteInfobarArgs = {
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteLayoutArgs = {
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteLocalPageArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteNavigationArgs = {
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeletePageArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteRatingArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteRegulationArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteSaleArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteServicePointArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteSiteArgs = {
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteUploadFileArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUsersPermissionsRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUsersPermissionsUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEmailConfirmationArgs = {
  confirmation: Scalars['String']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: UsersPermissionsLoginInput;
};


export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput;
};


export type MutationResetPasswordArgs = {
  code: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};


export type MutationUpdateAnnouncementArgs = {
  data: AnnouncementInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateBlogArgs = {
  data: BlogInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateBlogCategoryArgs = {
  data: BlogCategoryInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateCarCollectionArgs = {
  data: CarCollectionInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateCityArgs = {
  data: CityInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateDictionaryArgs = {
  data: DictionaryInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateFaqCategoryArgs = {
  data: FaqCategoryInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateFooterArgs = {
  data: FooterInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateGlobalArgs = {
  data: GlobalInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateInfobarArgs = {
  data: InfobarInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateLayoutArgs = {
  data: LayoutInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateLocalPageArgs = {
  data: LocalPageInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateNavigationArgs = {
  data: NavigationInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdatePageArgs = {
  data: PageInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateRatingArgs = {
  data: RatingInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateRegulationArgs = {
  data: RegulationInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateReviewWorkflowsWorkflowArgs = {
  data: ReviewWorkflowsWorkflowInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateReviewWorkflowsWorkflowStageArgs = {
  data: ReviewWorkflowsWorkflowStageInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateSaleArgs = {
  data: SaleInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateServicePointArgs = {
  data: ServicePointInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateSiteArgs = {
  data: SiteInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateSocialArgs = {
  data: SocialInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateUploadFileArgs = {
  id: Scalars['ID']['input'];
  info: InputMaybe<FileInfoInput>;
};


export type MutationUpdateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
  id: Scalars['ID']['input'];
};

export type Navigation = {
  __typename?: 'Navigation';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  items: Maybe<Array<Maybe<NavigationItemsDynamicZone>>>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Navigation>>;
  localizations_connection: Maybe<NavigationRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type NavigationInput = {
  items?: InputMaybe<Array<Scalars['NavigationItemsDynamicZoneInput']['input']>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type NavigationItemsDynamicZone = ComponentSharedLink | ComponentSharedLinkGroup | Error;

export type NavigationRelationResponseCollection = {
  __typename?: 'NavigationRelationResponseCollection';
  nodes: Array<Navigation>;
};

export type Page = {
  __typename?: 'Page';
  apiReference: Maybe<Scalars['String']['output']>;
  blocks: Maybe<Array<Maybe<PageBlocksDynamicZone>>>;
  components: Maybe<Array<Maybe<PageComponentsDynamicZone>>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  extraComponents: Maybe<Array<Maybe<PageExtraComponentsDynamicZone>>>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Page>>;
  localizations_connection: Maybe<PageRelationResponseCollection>;
  parentPage: Maybe<Page>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  sections: Maybe<Array<Maybe<PageSectionsDynamicZone>>>;
  seo: Maybe<ComponentSharedSeo>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type PageLocalizationsArgs = {
  filters: InputMaybe<PageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type PageLocalizations_ConnectionArgs = {
  filters: InputMaybe<PageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PageBlocksDynamicZone = ComponentBlocksBlogPosts | ComponentBlocksCars | ComponentBlocksComparison | ComponentBlocksContact | ComponentBlocksContent | ComponentBlocksCtaBand | ComponentBlocksFaq | ComponentBlocksFeatures | ComponentBlocksHero | ComponentBlocksLeadForm | ComponentBlocksLocations | ComponentBlocksLogos | ComponentBlocksMediaText | ComponentBlocksPromoCards | ComponentBlocksReviews | ComponentBlocksScenarios | ComponentBlocksTrustBar | Error;

export type PageComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedContact | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPromoShow | ComponentSharedReservationCalc | ComponentSharedSocialMedia | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type PageEntityResponseCollection = {
  __typename?: 'PageEntityResponseCollection';
  nodes: Array<Page>;
  pageInfo: Pagination;
};

export type PageExtraComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedContact | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPromoShow | ComponentSharedSocialMedia | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type PageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<PageFiltersInput>>>;
  apiReference?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<PageFiltersInput>;
  not?: InputMaybe<PageFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<PageFiltersInput>>>;
  parentPage?: InputMaybe<PageFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  seo?: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type PageInput = {
  apiReference?: InputMaybe<Scalars['String']['input']>;
  blocks?: InputMaybe<Array<Scalars['PageBlocksDynamicZoneInput']['input']>>;
  components?: InputMaybe<Array<Scalars['PageComponentsDynamicZoneInput']['input']>>;
  extraComponents?: InputMaybe<Array<Scalars['PageExtraComponentsDynamicZoneInput']['input']>>;
  parentPage?: InputMaybe<Scalars['ID']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  sections?: InputMaybe<Array<Scalars['PageSectionsDynamicZoneInput']['input']>>;
  seo?: InputMaybe<ComponentSharedSeoInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type PageRelationResponseCollection = {
  __typename?: 'PageRelationResponseCollection';
  nodes: Array<Page>;
};

export type PageSectionsDynamicZone = ComponentSectionsBlog | ComponentSectionsCarClasses | ComponentSectionsCards | ComponentSectionsCars | ComponentSectionsDivider | ComponentSectionsExtras | ComponentSectionsFaq | ComponentSectionsFeatures | ComponentSectionsForm | ComponentSectionsHero | ComponentSectionsImage | ComponentSectionsMap | ComponentSectionsReviews | ComponentSectionsSocial | ComponentSectionsSplit | ComponentSectionsText | ComponentSectionsVariantLabel | Error;

export type Pagination = {
  __typename?: 'Pagination';
  page: Scalars['Int']['output'];
  pageCount: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PaginationArg = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type PublicationFilter =
  | 'HAS_PUBLISHED_VERSION'
  | 'HAS_PUBLISHED_VERSION_DOCUMENT'
  | 'MODIFIED'
  | 'NEVER_PUBLISHED'
  | 'NEVER_PUBLISHED_DOCUMENT'
  | 'PUBLISHED_WITHOUT_DRAFT'
  | 'PUBLISHED_WITH_DRAFT'
  | 'UNMODIFIED';

export type PublicationStatus =
  | 'DRAFT'
  | 'PUBLISHED';

export type Query = {
  __typename?: 'Query';
  announcement: Maybe<Announcement>;
  blog: Maybe<Blog>;
  blogCategories: Array<Maybe<BlogCategory>>;
  blogCategories_connection: Maybe<BlogCategoryEntityResponseCollection>;
  blogCategory: Maybe<BlogCategory>;
  blogs: Array<Maybe<Blog>>;
  blogs_connection: Maybe<BlogEntityResponseCollection>;
  carCollection: Maybe<CarCollection>;
  carCollections: Array<Maybe<CarCollection>>;
  carCollections_connection: Maybe<CarCollectionEntityResponseCollection>;
  cities: Array<Maybe<City>>;
  cities_connection: Maybe<CityEntityResponseCollection>;
  city: Maybe<City>;
  dictionary: Maybe<Dictionary>;
  faqCategories: Array<Maybe<FaqCategory>>;
  faqCategories_connection: Maybe<FaqCategoryEntityResponseCollection>;
  faqCategory: Maybe<FaqCategory>;
  footer: Maybe<Footer>;
  global: Maybe<Global>;
  i18NLocale: Maybe<I18NLocale>;
  i18NLocales: Array<Maybe<I18NLocale>>;
  i18NLocales_connection: Maybe<I18NLocaleEntityResponseCollection>;
  infobar: Maybe<Infobar>;
  layout: Maybe<Layout>;
  localPage: Maybe<LocalPage>;
  localPages: Array<Maybe<LocalPage>>;
  localPages_connection: Maybe<LocalPageEntityResponseCollection>;
  me: Maybe<UsersPermissionsMe>;
  navigation: Maybe<Navigation>;
  page: Maybe<Page>;
  pages: Array<Maybe<Page>>;
  pages_connection: Maybe<PageEntityResponseCollection>;
  rating: Maybe<Rating>;
  ratings: Array<Maybe<Rating>>;
  ratings_connection: Maybe<RatingEntityResponseCollection>;
  regulation: Maybe<Regulation>;
  regulations: Array<Maybe<Regulation>>;
  regulations_connection: Maybe<RegulationEntityResponseCollection>;
  reviewWorkflowsWorkflow: Maybe<ReviewWorkflowsWorkflow>;
  reviewWorkflowsWorkflowStage: Maybe<ReviewWorkflowsWorkflowStage>;
  reviewWorkflowsWorkflowStages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  reviewWorkflowsWorkflowStages_connection: Maybe<ReviewWorkflowsWorkflowStageEntityResponseCollection>;
  reviewWorkflowsWorkflows: Array<Maybe<ReviewWorkflowsWorkflow>>;
  reviewWorkflowsWorkflows_connection: Maybe<ReviewWorkflowsWorkflowEntityResponseCollection>;
  sale: Maybe<Sale>;
  sales: Array<Maybe<Sale>>;
  sales_connection: Maybe<SaleEntityResponseCollection>;
  servicePoint: Maybe<ServicePoint>;
  servicePoints: Array<Maybe<ServicePoint>>;
  servicePoints_connection: Maybe<ServicePointEntityResponseCollection>;
  site: Maybe<Site>;
  social: Maybe<Social>;
  uploadFile: Maybe<UploadFile>;
  uploadFiles: Array<Maybe<UploadFile>>;
  uploadFiles_connection: Maybe<UploadFileEntityResponseCollection>;
  uploadFolder: Maybe<UploadFolder>;
  uploadFolders: Array<Maybe<UploadFolder>>;
  uploadFolders_connection: Maybe<UploadFolderEntityResponseCollection>;
  usersPermissionsRole: Maybe<UsersPermissionsRole>;
  usersPermissionsRoles: Array<Maybe<UsersPermissionsRole>>;
  usersPermissionsRoles_connection: Maybe<UsersPermissionsRoleEntityResponseCollection>;
  usersPermissionsUser: Maybe<UsersPermissionsUser>;
  usersPermissionsUsers: Array<Maybe<UsersPermissionsUser>>;
  usersPermissionsUsers_connection: Maybe<UsersPermissionsUserEntityResponseCollection>;
};


export type QueryAnnouncementArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryBlogArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryBlogCategoriesArgs = {
  filters: InputMaybe<BlogCategoryFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryBlogCategories_ConnectionArgs = {
  filters: InputMaybe<BlogCategoryFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryBlogCategoryArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryBlogsArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryBlogs_ConnectionArgs = {
  filters: InputMaybe<BlogFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCarCollectionArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCarCollectionsArgs = {
  filters: InputMaybe<CarCollectionFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCarCollections_ConnectionArgs = {
  filters: InputMaybe<CarCollectionFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCitiesArgs = {
  filters: InputMaybe<CityFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCities_ConnectionArgs = {
  filters: InputMaybe<CityFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCityArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryDictionaryArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryFaqCategoriesArgs = {
  filters: InputMaybe<FaqCategoryFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryFaqCategories_ConnectionArgs = {
  filters: InputMaybe<FaqCategoryFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryFaqCategoryArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryFooterArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryGlobalArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocaleArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocalesArgs = {
  filters: InputMaybe<I18NLocaleFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocales_ConnectionArgs = {
  filters: InputMaybe<I18NLocaleFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryInfobarArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLayoutArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLocalPageArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLocalPagesArgs = {
  filters: InputMaybe<LocalPageFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLocalPages_ConnectionArgs = {
  filters: InputMaybe<LocalPageFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryNavigationArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPageArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPagesArgs = {
  filters: InputMaybe<PageFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPages_ConnectionArgs = {
  filters: InputMaybe<PageFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRatingArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRatingsArgs = {
  filters: InputMaybe<RatingFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRatings_ConnectionArgs = {
  filters: InputMaybe<RatingFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRegulationArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRegulationsArgs = {
  filters: InputMaybe<RegulationFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRegulations_ConnectionArgs = {
  filters: InputMaybe<RegulationFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStagesArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowsArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflows_ConnectionArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySaleArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySalesArgs = {
  filters: InputMaybe<SaleFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySales_ConnectionArgs = {
  filters: InputMaybe<SaleFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServicePointArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServicePointsArgs = {
  filters: InputMaybe<ServicePointFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServicePoints_ConnectionArgs = {
  filters: InputMaybe<ServicePointFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySiteArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySocialArgs = {
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFileArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFilesArgs = {
  filters: InputMaybe<UploadFileFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFiles_ConnectionArgs = {
  filters: InputMaybe<UploadFileFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFolderArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFoldersArgs = {
  filters: InputMaybe<UploadFolderFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFolders_ConnectionArgs = {
  filters: InputMaybe<UploadFolderFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRoleArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRolesArgs = {
  filters: InputMaybe<UsersPermissionsRoleFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRoles_ConnectionArgs = {
  filters: InputMaybe<UsersPermissionsRoleFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUserArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUsersArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUsers_ConnectionArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};

export type Rating = {
  __typename?: 'Rating';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  date: Scalars['Date']['output'];
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Rating>>;
  localizations_connection: Maybe<RatingRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  rate: Scalars['Int']['output'];
  source: Scalars['String']['output'];
  text: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type RatingLocalizationsArgs = {
  filters: InputMaybe<RatingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RatingLocalizations_ConnectionArgs = {
  filters: InputMaybe<RatingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type RatingEntityResponseCollection = {
  __typename?: 'RatingEntityResponseCollection';
  nodes: Array<Rating>;
  pageInfo: Pagination;
};

export type RatingFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<RatingFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  date?: InputMaybe<DateFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<RatingFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<RatingFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<RatingFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  rate?: InputMaybe<IntFilterInput>;
  source?: InputMaybe<StringFilterInput>;
  text?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type RatingInput = {
  date?: InputMaybe<Scalars['Date']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  rate?: InputMaybe<Scalars['Int']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type RatingRelationResponseCollection = {
  __typename?: 'RatingRelationResponseCollection';
  nodes: Array<Rating>;
};

export type Regulation = {
  __typename?: 'Regulation';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  file: UploadFile;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Regulation>>;
  localizations_connection: Maybe<RegulationRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  slug: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type RegulationLocalizationsArgs = {
  filters: InputMaybe<RegulationFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RegulationLocalizations_ConnectionArgs = {
  filters: InputMaybe<RegulationFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type RegulationEntityResponseCollection = {
  __typename?: 'RegulationEntityResponseCollection';
  nodes: Array<Regulation>;
  pageInfo: Pagination;
};

export type RegulationFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<RegulationFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<RegulationFiltersInput>;
  not?: InputMaybe<RegulationFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<RegulationFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type RegulationInput = {
  file?: InputMaybe<Scalars['ID']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type RegulationRelationResponseCollection = {
  __typename?: 'RegulationRelationResponseCollection';
  nodes: Array<Regulation>;
};

export type ReviewWorkflowsWorkflow = {
  __typename?: 'ReviewWorkflowsWorkflow';
  contentTypes: Scalars['JSON']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  stageRequiredToPublish: Maybe<ReviewWorkflowsWorkflowStage>;
  stages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  stages_connection: Maybe<ReviewWorkflowsWorkflowStageRelationResponseCollection>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type ReviewWorkflowsWorkflowStagesArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ReviewWorkflowsWorkflowEntityResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowEntityResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflow>;
  pageInfo: Pagination;
};

export type ReviewWorkflowsWorkflowFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  contentTypes?: InputMaybe<JsonFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  stageRequiredToPublish?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  stages?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type ReviewWorkflowsWorkflowInput = {
  contentTypes?: InputMaybe<Scalars['JSON']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  stageRequiredToPublish?: InputMaybe<Scalars['ID']['input']>;
  stages?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type ReviewWorkflowsWorkflowStage = {
  __typename?: 'ReviewWorkflowsWorkflowStage';
  color: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  workflow: Maybe<ReviewWorkflowsWorkflow>;
};

export type ReviewWorkflowsWorkflowStageEntityResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowStageEntityResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflowStage>;
  pageInfo: Pagination;
};

export type ReviewWorkflowsWorkflowStageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  color?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  workflow?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
};

export type ReviewWorkflowsWorkflowStageInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  workflow?: InputMaybe<Scalars['ID']['input']>;
};

export type ReviewWorkflowsWorkflowStageRelationResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowStageRelationResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflowStage>;
};

export type Sale = {
  __typename?: 'Sale';
  Body: Maybe<Scalars['JSON']['output']>;
  Gallery: Array<Maybe<UploadFile>>;
  Gallery_connection: UploadFileRelationResponseCollection;
  Price: Scalars['Float']['output'];
  Seo: Maybe<Array<Maybe<ComponentSharedSeo>>>;
  Title: Scalars['String']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Sale>>;
  localizations_connection: Maybe<SaleRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  slug: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type SaleGalleryArgs = {
  filters: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SaleGallery_ConnectionArgs = {
  filters: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SaleSeoArgs = {
  filters: InputMaybe<ComponentSharedSeoFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SaleLocalizationsArgs = {
  filters: InputMaybe<SaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SaleLocalizations_ConnectionArgs = {
  filters: InputMaybe<SaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SaleEntityResponseCollection = {
  __typename?: 'SaleEntityResponseCollection';
  nodes: Array<Sale>;
  pageInfo: Pagination;
};

export type SaleFiltersInput = {
  Body?: InputMaybe<JsonFilterInput>;
  Price?: InputMaybe<FloatFilterInput>;
  Seo?: InputMaybe<ComponentSharedSeoFiltersInput>;
  Title?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<SaleFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<SaleFiltersInput>;
  not?: InputMaybe<SaleFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<SaleFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type SaleInput = {
  Body?: InputMaybe<Scalars['JSON']['input']>;
  Gallery?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  Price?: InputMaybe<Scalars['Float']['input']>;
  Seo?: InputMaybe<Array<InputMaybe<ComponentSharedSeoInput>>>;
  Title?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type SaleRelationResponseCollection = {
  __typename?: 'SaleRelationResponseCollection';
  nodes: Array<Sale>;
};

export type ServicePoint = {
  __typename?: 'ServicePoint';
  apiReference: Scalars['Int']['output'];
  city: Maybe<City>;
  components: Maybe<Array<Maybe<ServicePointComponentsDynamicZone>>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<ServicePoint>>;
  localizations_connection: Maybe<ServicePointRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  seo: Maybe<ComponentSharedSeo>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type ServicePointLocalizationsArgs = {
  filters: InputMaybe<ServicePointFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ServicePointLocalizations_ConnectionArgs = {
  filters: InputMaybe<ServicePointFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServicePointComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCard | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedMap | ComponentSharedSocialMedia | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type ServicePointEntityResponseCollection = {
  __typename?: 'ServicePointEntityResponseCollection';
  nodes: Array<ServicePoint>;
  pageInfo: Pagination;
};

export type ServicePointFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ServicePointFiltersInput>>>;
  apiReference?: InputMaybe<IntFilterInput>;
  city?: InputMaybe<CityFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<ServicePointFiltersInput>;
  not?: InputMaybe<ServicePointFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ServicePointFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  seo?: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type ServicePointInput = {
  apiReference?: InputMaybe<Scalars['Int']['input']>;
  city?: InputMaybe<Scalars['ID']['input']>;
  components?: InputMaybe<Array<Scalars['ServicePointComponentsDynamicZoneInput']['input']>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  seo?: InputMaybe<ComponentSharedSeoInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ServicePointRelationResponseCollection = {
  __typename?: 'ServicePointRelationResponseCollection';
  nodes: Array<ServicePoint>;
};

export type Site = {
  __typename?: 'Site';
  appStoreUrl: Maybe<Scalars['String']['output']>;
  contact: Maybe<ComponentSiteContact>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  googlePlayUrl: Maybe<Scalars['String']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Site>>;
  localizations_connection: Maybe<SiteRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  seo: Maybe<ComponentElementsSeo>;
  social: Maybe<Array<Maybe<ComponentSiteSocialLink>>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type SiteSocialArgs = {
  filters: InputMaybe<ComponentSiteSocialLinkFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SiteInput = {
  appStoreUrl?: InputMaybe<Scalars['String']['input']>;
  contact?: InputMaybe<ComponentSiteContactInput>;
  googlePlayUrl?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  seo?: InputMaybe<ComponentElementsSeoInput>;
  social?: InputMaybe<Array<InputMaybe<ComponentSiteSocialLinkInput>>>;
};

export type SiteRelationResponseCollection = {
  __typename?: 'SiteRelationResponseCollection';
  nodes: Array<Site>;
};

export type Social = {
  __typename?: 'Social';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  items: Maybe<Array<Maybe<ComponentSharedSocialUrl>>>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type SocialItemsArgs = {
  filters: InputMaybe<ComponentSharedSocialUrlFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SocialInput = {
  items?: InputMaybe<Array<InputMaybe<ComponentSharedSocialUrlInput>>>;
  locale?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type StringFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  containsi?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  eqi?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  nei?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<StringFilterInput>;
  notContains?: InputMaybe<Scalars['String']['input']>;
  notContainsi?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type TimeFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  contains?: InputMaybe<Scalars['Time']['input']>;
  containsi?: InputMaybe<Scalars['Time']['input']>;
  endsWith?: InputMaybe<Scalars['Time']['input']>;
  eq?: InputMaybe<Scalars['Time']['input']>;
  eqi?: InputMaybe<Scalars['Time']['input']>;
  gt?: InputMaybe<Scalars['Time']['input']>;
  gte?: InputMaybe<Scalars['Time']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  lt?: InputMaybe<Scalars['Time']['input']>;
  lte?: InputMaybe<Scalars['Time']['input']>;
  ne?: InputMaybe<Scalars['Time']['input']>;
  nei?: InputMaybe<Scalars['Time']['input']>;
  not?: InputMaybe<TimeFilterInput>;
  notContains?: InputMaybe<Scalars['Time']['input']>;
  notContainsi?: InputMaybe<Scalars['Time']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  startsWith?: InputMaybe<Scalars['Time']['input']>;
};

export type UploadFile = {
  __typename?: 'UploadFile';
  alternativeText: Maybe<Scalars['String']['output']>;
  caption: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  ext: Maybe<Scalars['String']['output']>;
  focalPoint: Maybe<Scalars['JSON']['output']>;
  formats: Maybe<Scalars['JSON']['output']>;
  hash: Scalars['String']['output'];
  height: Maybe<Scalars['Int']['output']>;
  mime: Scalars['String']['output'];
  name: Scalars['String']['output'];
  previewUrl: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  provider_metadata: Maybe<Scalars['JSON']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  related: Maybe<Array<Maybe<GenericMorph>>>;
  size: Scalars['Float']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  url: Scalars['String']['output'];
  width: Maybe<Scalars['Int']['output']>;
};

export type UploadFileEntityResponseCollection = {
  __typename?: 'UploadFileEntityResponseCollection';
  nodes: Array<UploadFile>;
  pageInfo: Pagination;
};

export type UploadFileFiltersInput = {
  alternativeText?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  caption?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  ext?: InputMaybe<StringFilterInput>;
  focalPoint?: InputMaybe<JsonFilterInput>;
  formats?: InputMaybe<JsonFilterInput>;
  hash?: InputMaybe<StringFilterInput>;
  height?: InputMaybe<IntFilterInput>;
  mime?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UploadFileFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  previewUrl?: InputMaybe<StringFilterInput>;
  provider?: InputMaybe<StringFilterInput>;
  provider_metadata?: InputMaybe<JsonFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  size?: InputMaybe<FloatFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  url?: InputMaybe<StringFilterInput>;
  width?: InputMaybe<IntFilterInput>;
};

export type UploadFileRelationResponseCollection = {
  __typename?: 'UploadFileRelationResponseCollection';
  nodes: Array<UploadFile>;
};

export type UploadFolder = {
  __typename?: 'UploadFolder';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  namePath: Maybe<Scalars['String']['output']>;
  parent: Maybe<UploadFolder>;
  path: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type UploadFolderEntityResponseCollection = {
  __typename?: 'UploadFolderEntityResponseCollection';
  nodes: Array<UploadFolder>;
  pageInfo: Pagination;
};

export type UploadFolderFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UploadFolderFiltersInput>>>;
  children?: InputMaybe<UploadFolderFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UploadFolderFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UploadFolderFiltersInput>>>;
  parent?: InputMaybe<UploadFolderFiltersInput>;
  path?: InputMaybe<StringFilterInput>;
  pathId?: InputMaybe<IntFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type UsersPermissionsCreateRolePayload = {
  __typename?: 'UsersPermissionsCreateRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsDeleteRolePayload = {
  __typename?: 'UsersPermissionsDeleteRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String']['input'];
  password: Scalars['String']['input'];
  provider?: Scalars['String']['input'];
};

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload';
  jwt: Maybe<Scalars['String']['output']>;
  user: UsersPermissionsMe;
};

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe';
  blocked: Maybe<Scalars['Boolean']['output']>;
  confirmed: Maybe<Scalars['Boolean']['output']>;
  documentId: Scalars['ID']['output'];
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  role: Maybe<UsersPermissionsMeRole>;
  username: Scalars['String']['output'];
};

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole';
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: Maybe<Scalars['String']['output']>;
};

export type UsersPermissionsPasswordPayload = {
  __typename?: 'UsersPermissionsPasswordPayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission';
  action: Scalars['String']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  role: Maybe<UsersPermissionsRole>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type UsersPermissionsPermissionFiltersInput = {
  action?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  not?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type UsersPermissionsPermissionRelationResponseCollection = {
  __typename?: 'UsersPermissionsPermissionRelationResponseCollection';
  nodes: Array<UsersPermissionsPermission>;
};

export type UsersPermissionsRegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Maybe<UsersPermissionsPermission>>;
  permissions_connection: Maybe<UsersPermissionsPermissionRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  type: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  users: Array<Maybe<UsersPermissionsUser>>;
  users_connection: Maybe<UsersPermissionsUserRelationResponseCollection>;
};


export type UsersPermissionsRolePermissionsArgs = {
  filters: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRolePermissions_ConnectionArgs = {
  filters: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRoleUsersArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRoleUsers_ConnectionArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UsersPermissionsRoleEntityResponseCollection = {
  __typename?: 'UsersPermissionsRoleEntityResponseCollection';
  nodes: Array<UsersPermissionsRole>;
  pageInfo: Pagination;
};

export type UsersPermissionsRoleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  permissions?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  users?: InputMaybe<UsersPermissionsUserFiltersInput>;
};

export type UsersPermissionsRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type UsersPermissionsUpdateRolePayload = {
  __typename?: 'UsersPermissionsUpdateRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser';
  blocked: Maybe<Scalars['Boolean']['output']>;
  confirmed: Maybe<Scalars['Boolean']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  provider: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  role: Maybe<UsersPermissionsRole>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse';
  data: Maybe<UsersPermissionsUser>;
};

export type UsersPermissionsUserEntityResponseCollection = {
  __typename?: 'UsersPermissionsUserEntityResponseCollection';
  nodes: Array<UsersPermissionsUser>;
  pageInfo: Pagination;
};

export type UsersPermissionsUserFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  blocked?: InputMaybe<BooleanFilterInput>;
  confirmed?: InputMaybe<BooleanFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  email?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UsersPermissionsUserFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  provider?: InputMaybe<StringFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  username?: InputMaybe<StringFilterInput>;
};

export type UsersPermissionsUserInput = {
  blocked?: InputMaybe<Scalars['Boolean']['input']>;
  confirmationToken?: InputMaybe<Scalars['String']['input']>;
  confirmed?: InputMaybe<Scalars['Boolean']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  resetPasswordToken?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['ID']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection';
  nodes: Array<UsersPermissionsUser>;
};

export type BlogRoutesQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type BlogRoutesQuery = { __typename?: 'Query', blogs_connection: { __typename?: 'BlogEntityResponseCollection', nodes: Array<{ __typename?: 'Blog', documentId: string, slug: string, updatedAt: any | null }>, pageInfo: { __typename?: 'Pagination', page: number, pageCount: number } } | null };

export type BlogPostQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type BlogPostQuery = { __typename?: 'Query', blog: { __typename?: 'Blog', updatedAt: any | null, documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, seo: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription: string | null, noIndex: boolean | null, noFollow: boolean | null, shareImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, blocks: Array<{ __typename: 'ComponentBlocksBlogPosts', id: string, badge: string | null, title: string, subtitle: string | null, source: Enum_Componentblocksblogposts_Source, limit: number | null, category: { __typename?: 'BlogCategory', documentId: string } | null, posts: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, cta: { __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null } | { __typename: 'ComponentBlocksCars', id: string, segmentIds: any | null, limit: number | null, defaultCategory: Enum_Componentblockscars_Defaultcategory | null, onlyPromotions: boolean | null, carsSource: Enum_Componentblockscars_Source, carsCategory: Enum_Componentblockscars_Category | null, carsLayout: Enum_Componentblockscars_Layout, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, carsCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksComparison', id: string, footnote: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, columns: Array<{ __typename?: 'ComponentElementsComparisonColumn', label: string, highlighted: boolean | null } | null>, rows: Array<{ __typename?: 'ComponentElementsComparisonRow', criterion: string, values: Array<{ __typename?: 'ComponentElementsComparisonValue', kind: Enum_Componentelementscomparisonvalue_Kind, text: string | null } | null> | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksContact', id: string, showCompany: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, contactImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, formTopics: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, departments: Array<{ __typename?: 'ComponentElementsDepartment', name: string, text: string | null, phone: string | null, email: string | null, hours: string | null, showInFooter: boolean | null, schedule: Array<{ __typename?: 'ComponentElementsOpeningHours', days: any, from: any | null, to: any | null, closed: boolean | null } | null> | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksContent', id: string, body: string | null, align: Enum_Componentblockscontent_Align | null, collapsible: boolean | null, previewParagraphs: number | null, collapsedLabel: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksCtaBand', id: string, title: string, text: string | null, tone: Enum_Componentblocksctaband_Tone, eyebrow: string | null, showStoreBadges: boolean | null, ctaVariant: Enum_Componentblocksctaband_Variant | null, primary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null }, secondary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, ctaImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, ctaImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, media: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | { __typename: 'ComponentBlocksFaq', id: string, structuredData: boolean | null, groupByCategory: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsFaqItem', question: string, answer: string, category: { __typename?: 'FaqCategory', documentId: string, name: string, slug: string, icon: string | null, order: number | null } | null } | null>, faqCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksFeatures', id: string, variant: Enum_Componentblocksfeatures_Variant, heading: string | null, items: Array<{ __typename?: 'ComponentElementsFeature', title: string, text: string | null, icon: string | null, tone: Enum_Componentelementsfeature_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> } | { __typename: 'ComponentBlocksHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentblockshero_Overlay, height: Enum_Componentblockshero_Height, reservationLayout: Enum_Componentblockshero_Reservationlayout, reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm, searchSide: Enum_Componentblockshero_Searchside | null, focalPoint: Enum_Componentblockshero_Focalpoint | null, breadcrumbLabel: string | null, heroLayout: Enum_Componentblockshero_Layout | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundVideo: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, highlights: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null, trust: { __typename?: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | null } | { __typename: 'ComponentBlocksLeadForm', id: string, contactTitle: string | null, contactText: string | null, consent: string, successTitle: string, successText: string | null, formVariant: Enum_Componentblocksleadform_Variant, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, steps: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksLocations', id: string, city: string | null, showMap: boolean | null, locationsFilter: Enum_Componentblockslocations_Filter, locationsLayout: Enum_Componentblockslocations_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksLogos', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, logos: Array<{ __typename?: 'ComponentElementsLogo', name: string, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksMediaText', id: string, body: string | null, imagePosition: Enum_Componentblocksmediatext_Imageposition | null, imageStyle: Enum_Componentblocksmediatext_Imagestyle | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksPromoCards', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, promos: Array<{ __typename?: 'ComponentElementsPromo', title: string, text: string | null, code: string | null, validFrom: any | null, validUntil: any | null, tone: Enum_Componentelementspromo_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, termsLink: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksReviews', id: string, limit: number | null, showSummary: boolean | null, reviewSource: Enum_Componentblocksreviews_Source | null, reviewsLayout: Enum_Componentblocksreviews_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksScenarios', id: string, scenariosLayout: Enum_Componentblocksscenarios_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsScenario', label: string, title: string, audience: string | null, text: string | null, benefits: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, cta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | { __typename: 'Error' } | null> | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null };

export type ChromeQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type ChromeQuery = { __typename?: 'Query', layout: { __typename?: 'Layout', footerText: string | null, companyName: string | null, legalText: string | null, header: Array<{ __typename?: 'ComponentMenuItem', label: string, submenu: Enum_Componentmenuitem_Submenu, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, links: Array<{ __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null> | null } | null> | null, footerGroups: Array<{ __typename?: 'ComponentMenuGroup', title: string, links: Array<{ __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null> | null } | null> | null, headerCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, legalLinks: Array<{ __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null> | null, paymentMethods: Array<{ __typename?: 'ComponentSitePaymentMethod', method: Enum_Componentsitepaymentmethod_Method } | null> | null } | null, announcement: { __typename?: 'Announcement', documentId: string, updatedAt: any | null, enabled: boolean, text: string, variant: Enum_Announcement_Variant, startsAt: any | null, endsAt: any | null, closable: boolean, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null, site: { __typename?: 'Site', appStoreUrl: string | null, googlePlayUrl: string | null, seo: { __typename?: 'ComponentElementsSeo', metaTitle: string | null, metaDescription: string | null, keywords: string | null, noIndex: boolean, noFollow: boolean, shareImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, contact: { __typename?: 'ComponentSiteContact', phone: string, email: string, address: string | null, openingHours: string | null, availabilityNote: string | null, whatsapp: string | null, chatUrl: string | null, legalName: string | null, nip: string | null, regon: string | null, krs: string | null, mapUrl: string | null, hours: Array<{ __typename?: 'ComponentElementsOpeningHours', days: any, from: any | null, to: any | null, closed: boolean | null } | null> | null, departments: Array<{ __typename?: 'ComponentElementsDepartment', name: string, text: string | null, phone: string | null, email: string | null, hours: string | null, showInFooter: boolean | null, schedule: Array<{ __typename?: 'ComponentElementsOpeningHours', days: any, from: any | null, to: any | null, closed: boolean | null } | null> | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> | null } | null, social: Array<{ __typename?: 'ComponentSiteSocialLink', platform: Enum_Componentsitesociallink_Platform, url: string } | null> | null } | null };

export type LatestPostsQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  limit: Scalars['Int']['input'];
}>;


export type LatestPostsQuery = { __typename?: 'Query', blogs: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null> };

export type SeoFragment = { __typename?: 'ComponentElementsSeo', metaTitle: string | null, metaDescription: string | null, keywords: string | null, noIndex: boolean, noFollow: boolean, shareImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null };

export type DocumentFileQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type DocumentFileQuery = { __typename?: 'Query', regulations: Array<{ __typename?: 'Regulation', file: { __typename?: 'UploadFile', url: string } } | null> };

export type PageQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type PageQuery = { __typename?: 'Query', page: { __typename?: 'Page', documentId: string, title: string, seo: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription: string | null, noIndex: boolean | null, noFollow: boolean | null, shareImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, sections: Array<{ __typename: 'ComponentSectionsBlog', id: string, badge: string | null, blogTitle: string | null, blogText: string | null, blogHeaderAlign: Enum_Componentsectionsblog_Headeralign, blogSource: Enum_Componentsectionsblog_Source, blogLayout: Enum_Componentsectionsblog_Layout, blogWidth: Enum_Componentsectionsblog_Width, blogSpacing: Enum_Componentsectionsblog_Spacing, posts: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsCarClasses', id: string, badge: string | null, carClassesTitle: string | null, carClassesText: string | null, carClassesHeaderAlign: Enum_Componentsectionscarclasses_Headeralign, carClassesSource: Enum_Componentsectionscarclasses_Source, carClassesCategories: any | null, carClassesLayout: Enum_Componentsectionscarclasses_Layout, carClassesWidth: Enum_Componentsectionscarclasses_Width, carClassesSpacing: Enum_Componentsectionscarclasses_Spacing, collections: Array<{ __typename?: 'ComponentPartsCollectionCard', collection: { __typename?: 'CarCollection', documentId: string, title: string, segmentIds: any | null, categories: any | null, fuels: any | null, bodies: any | null, gearboxes: any | null, minSeats: number | null, onlyPromotion: boolean | null, onlyPopular: boolean | null, sort: Enum_Carcollection_Sort } | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, moreCard: { __typename?: 'ComponentPartsCard', icon: string | null, title: string, text: string | null, tone: Enum_Componentpartscard_Tone, pattern: boolean | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsCards', id: string, badge: string | null, visibleCards: number | null, cardsTitle: string | null, cardsText: string | null, cardsHeaderAlign: Enum_Componentsectionscards_Headeralign, cardsDisplay: Enum_Componentsectionscards_Display, cardsWidth: Enum_Componentsectionscards_Width, cardsSpacing: Enum_Componentsectionscards_Spacing, cards: Array<{ __typename?: 'ComponentPartsCard', icon: string | null, title: string, text: string | null, tone: Enum_Componentpartscard_Tone, pattern: boolean | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsCars', id: string, badge: string | null, segmentIds: any | null, carIds: any | null, limit: number | null, carsTitle: string | null, carsText: string | null, carsHeaderAlign: Enum_Componentsectionscars_Headeralign, carsSource: Enum_Componentsectionscars_Source, carsCategory: Enum_Componentsectionscars_Category | null, carsLayout: Enum_Componentsectionscars_Layout, carsWidth: Enum_Componentsectionscars_Width, carsSpacing: Enum_Componentsectionscars_Spacing, collection: { __typename?: 'CarCollection', documentId: string, title: string, segmentIds: any | null, categories: any | null, fuels: any | null, bodies: any | null, gearboxes: any | null, minSeats: number | null, onlyPromotion: boolean | null, onlyPopular: boolean | null, sort: Enum_Carcollection_Sort } | null, moreCard: { __typename?: 'ComponentPartsCard', icon: string | null, title: string, text: string | null, tone: Enum_Componentpartscard_Tone, pattern: boolean | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsDivider', id: string, dividerStyle: Enum_Componentsectionsdivider_Style, dividerSize: Enum_Componentsectionsdivider_Size, dividerTone: Enum_Componentsectionsdivider_Tone, dividerDirection: Enum_Componentsectionsdivider_Direction } | { __typename: 'ComponentSectionsExtras', id: string, badge: string | null, extrasTitle: string | null, extrasText: string | null, extrasHeaderAlign: Enum_Componentsectionsextras_Headeralign, extrasGroup: Enum_Componentsectionsextras_Group, extrasWidth: Enum_Componentsectionsextras_Width, extrasSpacing: Enum_Componentsectionsextras_Spacing, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsFaq', id: string, badge: string | null, structuredData: boolean | null, faqTitle: string | null, faqText: string | null, faqHeaderAlign: Enum_Componentsectionsfaq_Headeralign, faqSearch: boolean | null, faqTextWidth: Enum_Componentsectionsfaq_Textwidth, faqWidth: Enum_Componentsectionsfaq_Width, faqSpacing: Enum_Componentsectionsfaq_Spacing, groups: Array<{ __typename?: 'ComponentPartsFaqGroup', title: string | null, icon: string | null, items: Array<{ __typename?: 'ComponentPartsFaqItem', question: string, answer: string } | null> } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsFeatures', id: string, badge: string | null, text: string | null, headerAlign: Enum_Componentsectionsfeatures_Headeralign, variant: Enum_Componentsectionsfeatures_Variant, display: Enum_Componentsectionsfeatures_Display, featuresTitle: string | null, featuresWidth: Enum_Componentsectionsfeatures_Width, featuresSpacing: Enum_Componentsectionsfeatures_Spacing, items: Array<{ __typename?: 'ComponentPartsFeatureItem', icon: string | null, title: string, text: string | null } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsForm', id: string, badge: string | null, formKind: Enum_Componentsectionsform_Formkind, formWidth: Enum_Componentsectionsform_Formwidth, formTitle: string | null, formText: string | null, formHeaderAlign: Enum_Componentsectionsform_Headeralign, formFrameWidth: Enum_Componentsectionsform_Width, formSpacing: Enum_Componentsectionsform_Spacing, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentsectionshero_Overlay, search: Enum_Componentsectionshero_Search, searchTerm: Enum_Componentsectionshero_Searchterm | null, searchSide: Enum_Componentsectionshero_Searchside | null, width: Enum_Componentsectionshero_Width, spacing: Enum_Componentsectionshero_Spacing, align: Enum_Componentsectionshero_Align | null, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, video: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, videoMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | { __typename: 'ComponentSectionsImage', id: string, caption: string | null, imageSize: Enum_Componentsectionsimage_Size, imageSpacing: Enum_Componentsectionsimage_Spacing, picture: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, pictureMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsMap', id: string, badge: string | null, showList: boolean | null, fullBleed: boolean | null, mapTitle: string | null, mapText: string | null, mapHeaderAlign: Enum_Componentsectionsmap_Headeralign, mapShowLegend: boolean | null, mapWidth: Enum_Componentsectionsmap_Width, mapSpacing: Enum_Componentsectionsmap_Spacing, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsReviews', id: string, badge: string | null, showScore: boolean | null, score: number | null, scoreLabel: string | null, reviewsTitle: string | null, reviewsText: string | null, reviewsHeaderAlign: Enum_Componentsectionsreviews_Headeralign, reviewsSource: Enum_Componentsectionsreviews_Source, reviewsLimit: number | null, reviewsLayout: Enum_Componentsectionsreviews_Layout, reviewsWidth: Enum_Componentsectionsreviews_Width, reviewsSpacing: Enum_Componentsectionsreviews_Spacing, ratings: Array<{ __typename?: 'Rating', documentId: string, name: string, rate: number, text: string } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsSocial', id: string, badge: string | null, showContact: boolean | null, socialTitle: string | null, socialText: string | null, socialLayout: Enum_Componentsectionssocial_Layout, socialWidth: Enum_Componentsectionssocial_Width, socialSpacing: Enum_Componentsectionssocial_Spacing, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsSplit', id: string, imageFit: Enum_Componentsectionssplit_Imagefit, imageStyle: Enum_Componentsectionssplit_Imagestyle, statValue: string | null, statLabel: string | null, badge: string | null, content: Enum_Componentsectionssplit_Content, mediaSide: Enum_Componentsectionssplit_Mediaside, splitMedia: Enum_Componentsectionssplit_Media, splitShowLegend: boolean | null, splitTitle: string | null, splitText: string | null, splitBody: string | null, splitStructuredData: boolean | null, splitWidth: Enum_Componentsectionssplit_Width, splitSpacing: Enum_Componentsectionssplit_Spacing, splitImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageSecond: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, features: Array<{ __typename?: 'ComponentPartsFeatureItem', icon: string | null, title: string, text: string | null } | null> | null, faqs: Array<{ __typename?: 'ComponentPartsFaqItem', question: string, answer: string } | null> | null, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsText', id: string, badge: string | null, body: string | null, textWidth: Enum_Componentsectionstext_Textwidth, collapsible: boolean | null, previewParagraphs: number | null, textTitle: string | null, textAlign: Enum_Componentsectionstext_Align, textFrameWidth: Enum_Componentsectionstext_Width, textSpacing: Enum_Componentsectionstext_Spacing, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentSectionsVariantLabel', id: string, title: string, note: string | null } | { __typename: 'Error' } | null> | null, blocks: Array<{ __typename: 'ComponentBlocksBlogPosts', id: string, badge: string | null, title: string, subtitle: string | null, source: Enum_Componentblocksblogposts_Source, limit: number | null, category: { __typename?: 'BlogCategory', documentId: string } | null, posts: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, cta: { __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null } | { __typename: 'ComponentBlocksCars', id: string, segmentIds: any | null, limit: number | null, defaultCategory: Enum_Componentblockscars_Defaultcategory | null, onlyPromotions: boolean | null, carsSource: Enum_Componentblockscars_Source, carsCategory: Enum_Componentblockscars_Category | null, carsLayout: Enum_Componentblockscars_Layout, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, carsCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksComparison', id: string, footnote: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, columns: Array<{ __typename?: 'ComponentElementsComparisonColumn', label: string, highlighted: boolean | null } | null>, rows: Array<{ __typename?: 'ComponentElementsComparisonRow', criterion: string, values: Array<{ __typename?: 'ComponentElementsComparisonValue', kind: Enum_Componentelementscomparisonvalue_Kind, text: string | null } | null> | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksContact', id: string, showCompany: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, contactImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, formTopics: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, departments: Array<{ __typename?: 'ComponentElementsDepartment', name: string, text: string | null, phone: string | null, email: string | null, hours: string | null, showInFooter: boolean | null, schedule: Array<{ __typename?: 'ComponentElementsOpeningHours', days: any, from: any | null, to: any | null, closed: boolean | null } | null> | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksContent', id: string, body: string | null, align: Enum_Componentblockscontent_Align | null, collapsible: boolean | null, previewParagraphs: number | null, collapsedLabel: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksCtaBand', id: string, title: string, text: string | null, tone: Enum_Componentblocksctaband_Tone, eyebrow: string | null, showStoreBadges: boolean | null, ctaVariant: Enum_Componentblocksctaband_Variant | null, primary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null }, secondary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, ctaImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, ctaImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, media: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | { __typename: 'ComponentBlocksFaq', id: string, structuredData: boolean | null, groupByCategory: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsFaqItem', question: string, answer: string, category: { __typename?: 'FaqCategory', documentId: string, name: string, slug: string, icon: string | null, order: number | null } | null } | null>, faqCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksFeatures', id: string, variant: Enum_Componentblocksfeatures_Variant, heading: string | null, items: Array<{ __typename?: 'ComponentElementsFeature', title: string, text: string | null, icon: string | null, tone: Enum_Componentelementsfeature_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> } | { __typename: 'ComponentBlocksHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentblockshero_Overlay, height: Enum_Componentblockshero_Height, reservationLayout: Enum_Componentblockshero_Reservationlayout, reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm, searchSide: Enum_Componentblockshero_Searchside | null, focalPoint: Enum_Componentblockshero_Focalpoint | null, breadcrumbLabel: string | null, heroLayout: Enum_Componentblockshero_Layout | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundVideo: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, highlights: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null, trust: { __typename?: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | null } | { __typename: 'ComponentBlocksLeadForm', id: string, contactTitle: string | null, contactText: string | null, consent: string, successTitle: string, successText: string | null, formVariant: Enum_Componentblocksleadform_Variant, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, steps: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksLocations', id: string, city: string | null, showMap: boolean | null, locationsFilter: Enum_Componentblockslocations_Filter, locationsLayout: Enum_Componentblockslocations_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksLogos', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, logos: Array<{ __typename?: 'ComponentElementsLogo', name: string, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksMediaText', id: string, body: string | null, imagePosition: Enum_Componentblocksmediatext_Imageposition | null, imageStyle: Enum_Componentblocksmediatext_Imagestyle | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksPromoCards', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, promos: Array<{ __typename?: 'ComponentElementsPromo', title: string, text: string | null, code: string | null, validFrom: any | null, validUntil: any | null, tone: Enum_Componentelementspromo_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, termsLink: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksReviews', id: string, limit: number | null, showSummary: boolean | null, reviewSource: Enum_Componentblocksreviews_Source | null, reviewsLayout: Enum_Componentblocksreviews_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksScenarios', id: string, scenariosLayout: Enum_Componentblocksscenarios_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsScenario', label: string, title: string, audience: string | null, text: string | null, benefits: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, cta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | { __typename: 'Error' } | null> | null } | null };

export type ScenariosBlockFragment = { __typename?: 'ComponentBlocksScenarios', id: string, scenariosLayout: Enum_Componentblocksscenarios_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsScenario', label: string, title: string, audience: string | null, text: string | null, benefits: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, cta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type ComparisonBlockFragment = { __typename?: 'ComponentBlocksComparison', id: string, footnote: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, columns: Array<{ __typename?: 'ComponentElementsComparisonColumn', label: string, highlighted: boolean | null } | null>, rows: Array<{ __typename?: 'ComponentElementsComparisonRow', criterion: string, values: Array<{ __typename?: 'ComponentElementsComparisonValue', kind: Enum_Componentelementscomparisonvalue_Kind, text: string | null } | null> | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type CarsBlockFragment = { __typename?: 'ComponentBlocksCars', id: string, segmentIds: any | null, limit: number | null, defaultCategory: Enum_Componentblockscars_Defaultcategory | null, onlyPromotions: boolean | null, carsSource: Enum_Componentblockscars_Source, carsCategory: Enum_Componentblockscars_Category | null, carsLayout: Enum_Componentblockscars_Layout, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, carsCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type LogosBlockFragment = { __typename?: 'ComponentBlocksLogos', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, logos: Array<{ __typename?: 'ComponentElementsLogo', name: string, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type LeadFormBlockFragment = { __typename?: 'ComponentBlocksLeadForm', id: string, contactTitle: string | null, contactText: string | null, consent: string, successTitle: string, successText: string | null, formVariant: Enum_Componentblocksleadform_Variant, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, steps: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type CtaBandBlockFragment = { __typename?: 'ComponentBlocksCtaBand', id: string, title: string, text: string | null, tone: Enum_Componentblocksctaband_Tone, eyebrow: string | null, showStoreBadges: boolean | null, ctaVariant: Enum_Componentblocksctaband_Variant | null, primary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null }, secondary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, ctaImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, ctaImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, media: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null };

export type DepartmentFragment = { __typename?: 'ComponentElementsDepartment', name: string, text: string | null, phone: string | null, email: string | null, hours: string | null, showInFooter: boolean | null, schedule: Array<{ __typename?: 'ComponentElementsOpeningHours', days: any, from: any | null, to: any | null, closed: boolean | null } | null> | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null };

export type PromoCardsBlockFragment = { __typename?: 'ComponentBlocksPromoCards', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, promos: Array<{ __typename?: 'ComponentElementsPromo', title: string, text: string | null, code: string | null, validFrom: any | null, validUntil: any | null, tone: Enum_Componentelementspromo_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, termsLink: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type TrustBarBlockFragment = { __typename?: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null };

export type ContactBlockFragment = { __typename?: 'ComponentBlocksContact', id: string, showCompany: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, contactImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, formTopics: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, departments: Array<{ __typename?: 'ComponentElementsDepartment', name: string, text: string | null, phone: string | null, email: string | null, hours: string | null, showInFooter: boolean | null, schedule: Array<{ __typename?: 'ComponentElementsOpeningHours', days: any, from: any | null, to: any | null, closed: boolean | null } | null> | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type ContentBlockFragment = { __typename?: 'ComponentBlocksContent', id: string, body: string | null, align: Enum_Componentblockscontent_Align | null, collapsible: boolean | null, previewParagraphs: number | null, collapsedLabel: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type MediaTextBlockFragment = { __typename?: 'ComponentBlocksMediaText', id: string, body: string | null, imagePosition: Enum_Componentblocksmediatext_Imageposition | null, imageStyle: Enum_Componentblocksmediatext_Imagestyle | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type ReviewsBlockFragment = { __typename?: 'ComponentBlocksReviews', id: string, limit: number | null, showSummary: boolean | null, reviewSource: Enum_Componentblocksreviews_Source | null, reviewsLayout: Enum_Componentblocksreviews_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type LocationsBlockFragment = { __typename?: 'ComponentBlocksLocations', id: string, city: string | null, showMap: boolean | null, locationsFilter: Enum_Componentblockslocations_Filter, locationsLayout: Enum_Componentblockslocations_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type SectionReviewsQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  limit: Scalars['Int']['input'];
}>;


export type SectionReviewsQuery = { __typename?: 'Query', ratings: Array<{ __typename?: 'Rating', documentId: string, name: string, rate: number, text: string } | null> };

export type ReviewsQueryVariables = Exact<{
  status: PublicationStatus;
}>;


export type ReviewsQuery = { __typename?: 'Query', ratings: Array<{ __typename?: 'Rating', documentId: string, name: string, rate: number, text: string, date: any, source: string } | null> };

export type FeaturesBlockFragment = { __typename?: 'ComponentBlocksFeatures', id: string, variant: Enum_Componentblocksfeatures_Variant, heading: string | null, items: Array<{ __typename?: 'ComponentElementsFeature', title: string, text: string | null, icon: string | null, tone: Enum_Componentelementsfeature_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> };

export type FaqBlockFragment = { __typename?: 'ComponentBlocksFaq', id: string, structuredData: boolean | null, groupByCategory: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsFaqItem', question: string, answer: string, category: { __typename?: 'FaqCategory', documentId: string, name: string, slug: string, icon: string | null, order: number | null } | null } | null>, faqCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type SectionHeaderFragment = { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null };

export type SectionFragment = { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null };

export type BlogCardsQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  limit: Scalars['Int']['input'];
  filters: InputMaybe<BlogFiltersInput>;
}>;


export type BlogCardsQuery = { __typename?: 'Query', blogs: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null> };

export type BlogCardFragment = { __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } };

export type BlogPostsBlockFragment = { __typename?: 'ComponentBlocksBlogPosts', id: string, badge: string | null, title: string, subtitle: string | null, source: Enum_Componentblocksblogposts_Source, limit: number | null, category: { __typename?: 'BlogCategory', documentId: string } | null, posts: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, cta: { __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null };

export type HeroSectionFragment = { __typename?: 'ComponentSectionsHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentsectionshero_Overlay, search: Enum_Componentsectionshero_Search, searchTerm: Enum_Componentsectionshero_Searchterm | null, searchSide: Enum_Componentsectionshero_Searchside | null, width: Enum_Componentsectionshero_Width, spacing: Enum_Componentsectionshero_Spacing, align: Enum_Componentsectionshero_Align | null, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, video: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, videoMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null };

export type SectionBackgroundFragment = { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null };

export type FeaturesSectionFragment = { __typename?: 'ComponentSectionsFeatures', id: string, badge: string | null, text: string | null, headerAlign: Enum_Componentsectionsfeatures_Headeralign, variant: Enum_Componentsectionsfeatures_Variant, display: Enum_Componentsectionsfeatures_Display, featuresTitle: string | null, featuresWidth: Enum_Componentsectionsfeatures_Width, featuresSpacing: Enum_Componentsectionsfeatures_Spacing, items: Array<{ __typename?: 'ComponentPartsFeatureItem', icon: string | null, title: string, text: string | null } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type TextSectionFragment = { __typename?: 'ComponentSectionsText', id: string, badge: string | null, body: string | null, textWidth: Enum_Componentsectionstext_Textwidth, collapsible: boolean | null, previewParagraphs: number | null, textTitle: string | null, textAlign: Enum_Componentsectionstext_Align, textFrameWidth: Enum_Componentsectionstext_Width, textSpacing: Enum_Componentsectionstext_Spacing, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type FaqSectionFragment = { __typename?: 'ComponentSectionsFaq', id: string, badge: string | null, structuredData: boolean | null, faqTitle: string | null, faqText: string | null, faqHeaderAlign: Enum_Componentsectionsfaq_Headeralign, faqSearch: boolean | null, faqTextWidth: Enum_Componentsectionsfaq_Textwidth, faqWidth: Enum_Componentsectionsfaq_Width, faqSpacing: Enum_Componentsectionsfaq_Spacing, groups: Array<{ __typename?: 'ComponentPartsFaqGroup', title: string | null, icon: string | null, items: Array<{ __typename?: 'ComponentPartsFaqItem', question: string, answer: string } | null> } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type CardsSectionFragment = { __typename?: 'ComponentSectionsCards', id: string, badge: string | null, visibleCards: number | null, cardsTitle: string | null, cardsText: string | null, cardsHeaderAlign: Enum_Componentsectionscards_Headeralign, cardsDisplay: Enum_Componentsectionscards_Display, cardsWidth: Enum_Componentsectionscards_Width, cardsSpacing: Enum_Componentsectionscards_Spacing, cards: Array<{ __typename?: 'ComponentPartsCard', icon: string | null, title: string, text: string | null, tone: Enum_Componentpartscard_Tone, pattern: boolean | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type BlogSectionFragment = { __typename?: 'ComponentSectionsBlog', id: string, badge: string | null, blogTitle: string | null, blogText: string | null, blogHeaderAlign: Enum_Componentsectionsblog_Headeralign, blogSource: Enum_Componentsectionsblog_Source, blogLayout: Enum_Componentsectionsblog_Layout, blogWidth: Enum_Componentsectionsblog_Width, blogSpacing: Enum_Componentsectionsblog_Spacing, posts: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type SocialSectionFragment = { __typename?: 'ComponentSectionsSocial', id: string, badge: string | null, showContact: boolean | null, socialTitle: string | null, socialText: string | null, socialLayout: Enum_Componentsectionssocial_Layout, socialWidth: Enum_Componentsectionssocial_Width, socialSpacing: Enum_Componentsectionssocial_Spacing, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type CarsSectionFragment = { __typename?: 'ComponentSectionsCars', id: string, badge: string | null, segmentIds: any | null, carIds: any | null, limit: number | null, carsTitle: string | null, carsText: string | null, carsHeaderAlign: Enum_Componentsectionscars_Headeralign, carsSource: Enum_Componentsectionscars_Source, carsCategory: Enum_Componentsectionscars_Category | null, carsLayout: Enum_Componentsectionscars_Layout, carsWidth: Enum_Componentsectionscars_Width, carsSpacing: Enum_Componentsectionscars_Spacing, collection: { __typename?: 'CarCollection', documentId: string, title: string, segmentIds: any | null, categories: any | null, fuels: any | null, bodies: any | null, gearboxes: any | null, minSeats: number | null, onlyPromotion: boolean | null, onlyPopular: boolean | null, sort: Enum_Carcollection_Sort } | null, moreCard: { __typename?: 'ComponentPartsCard', icon: string | null, title: string, text: string | null, tone: Enum_Componentpartscard_Tone, pattern: boolean | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type CarCollectionFragment = { __typename?: 'CarCollection', documentId: string, title: string, segmentIds: any | null, categories: any | null, fuels: any | null, bodies: any | null, gearboxes: any | null, minSeats: number | null, onlyPromotion: boolean | null, onlyPopular: boolean | null, sort: Enum_Carcollection_Sort };

export type CarClassesSectionFragment = { __typename?: 'ComponentSectionsCarClasses', id: string, badge: string | null, carClassesTitle: string | null, carClassesText: string | null, carClassesHeaderAlign: Enum_Componentsectionscarclasses_Headeralign, carClassesSource: Enum_Componentsectionscarclasses_Source, carClassesCategories: any | null, carClassesLayout: Enum_Componentsectionscarclasses_Layout, carClassesWidth: Enum_Componentsectionscarclasses_Width, carClassesSpacing: Enum_Componentsectionscarclasses_Spacing, collections: Array<{ __typename?: 'ComponentPartsCollectionCard', collection: { __typename?: 'CarCollection', documentId: string, title: string, segmentIds: any | null, categories: any | null, fuels: any | null, bodies: any | null, gearboxes: any | null, minSeats: number | null, onlyPromotion: boolean | null, onlyPopular: boolean | null, sort: Enum_Carcollection_Sort } | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, moreCard: { __typename?: 'ComponentPartsCard', icon: string | null, title: string, text: string | null, tone: Enum_Componentpartscard_Tone, pattern: boolean | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type ExtrasSectionFragment = { __typename?: 'ComponentSectionsExtras', id: string, badge: string | null, extrasTitle: string | null, extrasText: string | null, extrasHeaderAlign: Enum_Componentsectionsextras_Headeralign, extrasGroup: Enum_Componentsectionsextras_Group, extrasWidth: Enum_Componentsectionsextras_Width, extrasSpacing: Enum_Componentsectionsextras_Spacing, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type MapSectionFragment = { __typename?: 'ComponentSectionsMap', id: string, badge: string | null, showList: boolean | null, fullBleed: boolean | null, mapTitle: string | null, mapText: string | null, mapHeaderAlign: Enum_Componentsectionsmap_Headeralign, mapShowLegend: boolean | null, mapWidth: Enum_Componentsectionsmap_Width, mapSpacing: Enum_Componentsectionsmap_Spacing, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type ReviewsSectionFragment = { __typename?: 'ComponentSectionsReviews', id: string, badge: string | null, showScore: boolean | null, score: number | null, scoreLabel: string | null, reviewsTitle: string | null, reviewsText: string | null, reviewsHeaderAlign: Enum_Componentsectionsreviews_Headeralign, reviewsSource: Enum_Componentsectionsreviews_Source, reviewsLimit: number | null, reviewsLayout: Enum_Componentsectionsreviews_Layout, reviewsWidth: Enum_Componentsectionsreviews_Width, reviewsSpacing: Enum_Componentsectionsreviews_Spacing, ratings: Array<{ __typename?: 'Rating', documentId: string, name: string, rate: number, text: string } | null>, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type SectionReviewFragment = { __typename?: 'Rating', documentId: string, name: string, rate: number, text: string };

export type ImageSectionFragment = { __typename?: 'ComponentSectionsImage', id: string, caption: string | null, imageSize: Enum_Componentsectionsimage_Size, imageSpacing: Enum_Componentsectionsimage_Spacing, picture: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, pictureMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type DividerSectionFragment = { __typename?: 'ComponentSectionsDivider', id: string, dividerStyle: Enum_Componentsectionsdivider_Style, dividerSize: Enum_Componentsectionsdivider_Size, dividerTone: Enum_Componentsectionsdivider_Tone, dividerDirection: Enum_Componentsectionsdivider_Direction };

export type SplitSectionFragment = { __typename?: 'ComponentSectionsSplit', id: string, imageFit: Enum_Componentsectionssplit_Imagefit, imageStyle: Enum_Componentsectionssplit_Imagestyle, statValue: string | null, statLabel: string | null, badge: string | null, content: Enum_Componentsectionssplit_Content, mediaSide: Enum_Componentsectionssplit_Mediaside, splitMedia: Enum_Componentsectionssplit_Media, splitShowLegend: boolean | null, splitTitle: string | null, splitText: string | null, splitBody: string | null, splitStructuredData: boolean | null, splitWidth: Enum_Componentsectionssplit_Width, splitSpacing: Enum_Componentsectionssplit_Spacing, splitImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageSecond: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, features: Array<{ __typename?: 'ComponentPartsFeatureItem', icon: string | null, title: string, text: string | null } | null> | null, faqs: Array<{ __typename?: 'ComponentPartsFaqItem', question: string, answer: string } | null> | null, ctas: Array<{ __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type FormSectionFragment = { __typename?: 'ComponentSectionsForm', id: string, badge: string | null, formKind: Enum_Componentsectionsform_Formkind, formWidth: Enum_Componentsectionsform_Formwidth, formTitle: string | null, formText: string | null, formHeaderAlign: Enum_Componentsectionsform_Headeralign, formFrameWidth: Enum_Componentsectionsform_Width, formSpacing: Enum_Componentsectionsform_Spacing, background: { __typename?: 'ComponentPartsBackground', tone: Enum_Componentpartsbackground_Tone, pattern: boolean | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null };

export type PartCardFragment = { __typename?: 'ComponentPartsCard', icon: string | null, title: string, text: string | null, tone: Enum_Componentpartscard_Tone, pattern: boolean | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null };

export type PartLinkFragment = { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null };

export type PartCtaFragment = { __typename?: 'ComponentPartsCta', variant: Enum_Componentpartscta_Variant, icon: string | null, link: { __typename?: 'ComponentPartsLink', label: string | null, linkType: Enum_Componentpartslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } };

export type MediaFragment = { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null };

export type LinkFragment = { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null };

export type CtaFragment = { __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } };

export type HeroBlockFragment = { __typename?: 'ComponentBlocksHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentblockshero_Overlay, height: Enum_Componentblockshero_Height, reservationLayout: Enum_Componentblockshero_Reservationlayout, reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm, searchSide: Enum_Componentblockshero_Searchside | null, focalPoint: Enum_Componentblockshero_Focalpoint | null, breadcrumbLabel: string | null, heroLayout: Enum_Componentblockshero_Layout | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundVideo: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, highlights: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null, trust: { __typename?: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | null };

export type PlaceLinksQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type PlaceLinksQuery = { __typename?: 'Query', cities: Array<{ __typename?: 'City', slug: string, title: string, kind: Enum_City_Kind | null, shortName: string | null } | null>, localPages: Array<{ __typename?: 'LocalPage', slug: string | null, shortName: string | null, title: string } | null> };

export type CityRoutesQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type CityRoutesQuery = { __typename?: 'Query', cities_connection: { __typename?: 'CityEntityResponseCollection', nodes: Array<{ __typename?: 'City', documentId: string, slug: string, updatedAt: any | null }>, pageInfo: { __typename?: 'Pagination', page: number, pageCount: number } } | null };

export type LocalPageRoutesQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type LocalPageRoutesQuery = { __typename?: 'Query', localPages_connection: { __typename?: 'LocalPageEntityResponseCollection', nodes: Array<{ __typename?: 'LocalPage', documentId: string, slug: string | null, updatedAt: any | null }>, pageInfo: { __typename?: 'Pagination', page: number, pageCount: number } } | null };

export type CityQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type CityQuery = { __typename?: 'Query', city: { __typename?: 'City', documentId: string, title: string, pickupPoint: number | null, seo: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription: string | null, noIndex: boolean | null, noFollow: boolean | null, shareImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, blocks: Array<{ __typename: 'ComponentBlocksBlogPosts', id: string, badge: string | null, title: string, subtitle: string | null, source: Enum_Componentblocksblogposts_Source, limit: number | null, category: { __typename?: 'BlogCategory', documentId: string } | null, posts: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, cta: { __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null } | { __typename: 'ComponentBlocksCars', id: string, segmentIds: any | null, limit: number | null, defaultCategory: Enum_Componentblockscars_Defaultcategory | null, onlyPromotions: boolean | null, carsSource: Enum_Componentblockscars_Source, carsCategory: Enum_Componentblockscars_Category | null, carsLayout: Enum_Componentblockscars_Layout, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, carsCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksComparison', id: string, footnote: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, columns: Array<{ __typename?: 'ComponentElementsComparisonColumn', label: string, highlighted: boolean | null } | null>, rows: Array<{ __typename?: 'ComponentElementsComparisonRow', criterion: string, values: Array<{ __typename?: 'ComponentElementsComparisonValue', kind: Enum_Componentelementscomparisonvalue_Kind, text: string | null } | null> | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksContact', id: string, showCompany: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, contactImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, formTopics: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, departments: Array<{ __typename?: 'ComponentElementsDepartment', name: string, text: string | null, phone: string | null, email: string | null, hours: string | null, showInFooter: boolean | null, schedule: Array<{ __typename?: 'ComponentElementsOpeningHours', days: any, from: any | null, to: any | null, closed: boolean | null } | null> | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksContent', id: string, body: string | null, align: Enum_Componentblockscontent_Align | null, collapsible: boolean | null, previewParagraphs: number | null, collapsedLabel: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksCtaBand', id: string, title: string, text: string | null, tone: Enum_Componentblocksctaband_Tone, eyebrow: string | null, showStoreBadges: boolean | null, ctaVariant: Enum_Componentblocksctaband_Variant | null, primary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null }, secondary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, ctaImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, ctaImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, media: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | { __typename: 'ComponentBlocksFaq', id: string, structuredData: boolean | null, groupByCategory: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsFaqItem', question: string, answer: string, category: { __typename?: 'FaqCategory', documentId: string, name: string, slug: string, icon: string | null, order: number | null } | null } | null>, faqCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksFeatures', id: string, variant: Enum_Componentblocksfeatures_Variant, heading: string | null, items: Array<{ __typename?: 'ComponentElementsFeature', title: string, text: string | null, icon: string | null, tone: Enum_Componentelementsfeature_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> } | { __typename: 'ComponentBlocksHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentblockshero_Overlay, height: Enum_Componentblockshero_Height, reservationLayout: Enum_Componentblockshero_Reservationlayout, reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm, searchSide: Enum_Componentblockshero_Searchside | null, focalPoint: Enum_Componentblockshero_Focalpoint | null, breadcrumbLabel: string | null, heroLayout: Enum_Componentblockshero_Layout | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundVideo: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, highlights: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null, trust: { __typename?: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | null } | { __typename: 'ComponentBlocksLeadForm', id: string, contactTitle: string | null, contactText: string | null, consent: string, successTitle: string, successText: string | null, formVariant: Enum_Componentblocksleadform_Variant, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, steps: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksLocations', id: string, city: string | null, showMap: boolean | null, locationsFilter: Enum_Componentblockslocations_Filter, locationsLayout: Enum_Componentblockslocations_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksLogos', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, logos: Array<{ __typename?: 'ComponentElementsLogo', name: string, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksMediaText', id: string, body: string | null, imagePosition: Enum_Componentblocksmediatext_Imageposition | null, imageStyle: Enum_Componentblocksmediatext_Imagestyle | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksPromoCards', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, promos: Array<{ __typename?: 'ComponentElementsPromo', title: string, text: string | null, code: string | null, validFrom: any | null, validUntil: any | null, tone: Enum_Componentelementspromo_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, termsLink: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksReviews', id: string, limit: number | null, showSummary: boolean | null, reviewSource: Enum_Componentblocksreviews_Source | null, reviewsLayout: Enum_Componentblocksreviews_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksScenarios', id: string, scenariosLayout: Enum_Componentblocksscenarios_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsScenario', label: string, title: string, audience: string | null, text: string | null, benefits: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, cta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | { __typename: 'Error' } | null> | null } | null };

export type LocalPageQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type LocalPageQuery = { __typename?: 'Query', localPage: { __typename?: 'LocalPage', documentId: string, pickupPoint: number | null, title: string, seo: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription: string | null, noIndex: boolean | null, noFollow: boolean | null, shareImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, blocks: Array<{ __typename: 'ComponentBlocksBlogPosts', id: string, badge: string | null, title: string, subtitle: string | null, source: Enum_Componentblocksblogposts_Source, limit: number | null, category: { __typename?: 'BlogCategory', documentId: string } | null, posts: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, excerpt: string | null, publishedAt: any | null, createdAt: any | null, category: { __typename?: 'BlogCategory', documentId: string, name: string, color: Enum_Blogcategory_Color | null } | null, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, cta: { __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null } | { __typename: 'ComponentBlocksCars', id: string, segmentIds: any | null, limit: number | null, defaultCategory: Enum_Componentblockscars_Defaultcategory | null, onlyPromotions: boolean | null, carsSource: Enum_Componentblockscars_Source, carsCategory: Enum_Componentblockscars_Category | null, carsLayout: Enum_Componentblockscars_Layout, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, carsCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksComparison', id: string, footnote: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, columns: Array<{ __typename?: 'ComponentElementsComparisonColumn', label: string, highlighted: boolean | null } | null>, rows: Array<{ __typename?: 'ComponentElementsComparisonRow', criterion: string, values: Array<{ __typename?: 'ComponentElementsComparisonValue', kind: Enum_Componentelementscomparisonvalue_Kind, text: string | null } | null> | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksContact', id: string, showCompany: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, contactImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, formTopics: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, departments: Array<{ __typename?: 'ComponentElementsDepartment', name: string, text: string | null, phone: string | null, email: string | null, hours: string | null, showInFooter: boolean | null, schedule: Array<{ __typename?: 'ComponentElementsOpeningHours', days: any, from: any | null, to: any | null, closed: boolean | null } | null> | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksContent', id: string, body: string | null, align: Enum_Componentblockscontent_Align | null, collapsible: boolean | null, previewParagraphs: number | null, collapsedLabel: string | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksCtaBand', id: string, title: string, text: string | null, tone: Enum_Componentblocksctaband_Tone, eyebrow: string | null, showStoreBadges: boolean | null, ctaVariant: Enum_Componentblocksctaband_Variant | null, primary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null }, secondary: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, ctaImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, ctaImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, media: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | { __typename: 'ComponentBlocksFaq', id: string, structuredData: boolean | null, groupByCategory: boolean | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsFaqItem', question: string, answer: string, category: { __typename?: 'FaqCategory', documentId: string, name: string, slug: string, icon: string | null, order: number | null } | null } | null>, faqCta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksFeatures', id: string, variant: Enum_Componentblocksfeatures_Variant, heading: string | null, items: Array<{ __typename?: 'ComponentElementsFeature', title: string, text: string | null, icon: string | null, tone: Enum_Componentelementsfeature_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null> } | { __typename: 'ComponentBlocksHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentblockshero_Overlay, height: Enum_Componentblockshero_Height, reservationLayout: Enum_Componentblockshero_Reservationlayout, reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm, searchSide: Enum_Componentblockshero_Searchside | null, focalPoint: Enum_Componentblockshero_Focalpoint | null, breadcrumbLabel: string | null, heroLayout: Enum_Componentblockshero_Layout | null, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundVideo: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, highlights: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null, trust: { __typename?: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | null } | { __typename: 'ComponentBlocksLeadForm', id: string, contactTitle: string | null, contactText: string | null, consent: string, successTitle: string, successText: string | null, formVariant: Enum_Componentblocksleadform_Variant, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, steps: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksLocations', id: string, city: string | null, showMap: boolean | null, locationsFilter: Enum_Componentblockslocations_Filter, locationsLayout: Enum_Componentblockslocations_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksLogos', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, logos: Array<{ __typename?: 'ComponentElementsLogo', name: string, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksMediaText', id: string, body: string | null, imagePosition: Enum_Componentblocksmediatext_Imageposition | null, imageStyle: Enum_Componentblocksmediatext_Imagestyle | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksPromoCards', id: string, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, promos: Array<{ __typename?: 'ComponentElementsPromo', title: string, text: string | null, code: string | null, validFrom: any | null, validUntil: any | null, tone: Enum_Componentelementspromo_Tone | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, termsLink: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksReviews', id: string, limit: number | null, showSummary: boolean | null, reviewSource: Enum_Componentblocksreviews_Source | null, reviewsLayout: Enum_Componentblocksreviews_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksScenarios', id: string, scenariosLayout: Enum_Componentblocksscenarios_Layout | null, header: { __typename?: 'ComponentElementsSectionHeader', eyebrow: string | null, title: string | null, lead: string | null } | null, items: Array<{ __typename?: 'ComponentElementsScenario', label: string, title: string, audience: string | null, text: string | null, benefits: Array<{ __typename?: 'ComponentElementsListItem', text: string } | null> | null, image: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, imageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, cta: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null>, section: { __typename?: 'ComponentElementsSection', tone: Enum_Componentelementssection_Tone | null, spacing: Enum_Componentelementssection_Spacing | null, width: Enum_Componentelementssection_Width | null, anchor: string | null, background: Enum_Componentelementssection_Background | null, ornament: Enum_Componentelementssection_Ornament | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null } | { __typename: 'ComponentBlocksTrustBar', id: string, showRating: boolean | null, trustVariant: Enum_Componentblockstrustbar_Variant, stats: Array<{ __typename?: 'ComponentElementsStatRef', kind: Enum_Componentelementsstatref_Kind } | null> | null, claims: Array<{ __typename?: 'ComponentElementsHighlight', icon: string | null, text: string } | null> | null } | { __typename: 'Error' } | null> | null } | null };

export type PageRoutesQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type PageRoutesQuery = { __typename?: 'Query', pages_connection: { __typename?: 'PageEntityResponseCollection', nodes: Array<{ __typename?: 'Page', documentId: string, slug: string, updatedAt: any | null, parentPage: { __typename?: 'Page', documentId: string } | null }>, pageInfo: { __typename?: 'Pagination', page: number, pageCount: number } } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const MediaFragmentDoc = new TypedDocumentString(`
    fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
    `, {"fragmentName":"Media"}) as unknown as TypedDocumentString<MediaFragment, unknown>;
export const SeoFragmentDoc = new TypedDocumentString(`
    fragment Seo on ComponentElementsSeo {
  metaTitle
  metaDescription
  keywords
  noIndex
  noFollow
  shareImage {
    ...Media
  }
}
    fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"Seo"}) as unknown as TypedDocumentString<SeoFragment, unknown>;
export const SectionHeaderFragmentDoc = new TypedDocumentString(`
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
    `, {"fragmentName":"SectionHeader"}) as unknown as TypedDocumentString<SectionHeaderFragment, unknown>;
export const LinkFragmentDoc = new TypedDocumentString(`
    fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
    `, {"fragmentName":"Link"}) as unknown as TypedDocumentString<LinkFragment, unknown>;
export const SectionFragmentDoc = new TypedDocumentString(`
    fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
    fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"Section"}) as unknown as TypedDocumentString<SectionFragment, unknown>;
export const ScenariosBlockFragmentDoc = new TypedDocumentString(`
    fragment ScenariosBlock on ComponentBlocksScenarios {
  id
  header {
    ...SectionHeader
  }
  scenariosLayout: layout
  items {
    label
    title
    audience
    text
    benefits {
      text
    }
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    cta {
      ...Link
    }
  }
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"ScenariosBlock"}) as unknown as TypedDocumentString<ScenariosBlockFragment, unknown>;
export const ComparisonBlockFragmentDoc = new TypedDocumentString(`
    fragment ComparisonBlock on ComponentBlocksComparison {
  id
  header {
    ...SectionHeader
  }
  columns {
    label
    highlighted
  }
  rows {
    criterion
    values {
      kind
      text
    }
  }
  footnote
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"ComparisonBlock"}) as unknown as TypedDocumentString<ComparisonBlockFragment, unknown>;
export const CarsBlockFragmentDoc = new TypedDocumentString(`
    fragment CarsBlock on ComponentBlocksCars {
  id
  header {
    ...SectionHeader
  }
  carsSource: source
  segmentIds
  carsCategory: category
  limit
  carsLayout: layout
  defaultCategory
  onlyPromotions
  carsCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"CarsBlock"}) as unknown as TypedDocumentString<CarsBlockFragment, unknown>;
export const LogosBlockFragmentDoc = new TypedDocumentString(`
    fragment LogosBlock on ComponentBlocksLogos {
  id
  header {
    ...SectionHeader
  }
  logos: items {
    name
    image {
      ...Media
    }
  }
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"LogosBlock"}) as unknown as TypedDocumentString<LogosBlockFragment, unknown>;
export const LeadFormBlockFragmentDoc = new TypedDocumentString(`
    fragment LeadFormBlock on ComponentBlocksLeadForm {
  id
  header {
    ...SectionHeader
  }
  formVariant: variant
  contactTitle
  contactText
  steps {
    text
  }
  consent
  successTitle
  successText
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"LeadFormBlock"}) as unknown as TypedDocumentString<LeadFormBlockFragment, unknown>;
export const CtaBandBlockFragmentDoc = new TypedDocumentString(`
    fragment CtaBandBlock on ComponentBlocksCtaBand {
  id
  title
  text
  primary {
    ...Link
  }
  secondary {
    ...Link
  }
  tone
  ctaVariant: variant
  eyebrow
  ctaImage: image {
    ...Media
  }
  ctaImageMobile: imageMobile {
    ...Media
  }
  media {
    ...Media
  }
  showStoreBadges
}
    fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"CtaBandBlock"}) as unknown as TypedDocumentString<CtaBandBlockFragment, unknown>;
export const PromoCardsBlockFragmentDoc = new TypedDocumentString(`
    fragment PromoCardsBlock on ComponentBlocksPromoCards {
  id
  header {
    ...SectionHeader
  }
  promos: items {
    title
    text
    code
    validFrom
    validUntil
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
    termsLink {
      ...Link
    }
  }
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"PromoCardsBlock"}) as unknown as TypedDocumentString<PromoCardsBlockFragment, unknown>;
export const DepartmentFragmentDoc = new TypedDocumentString(`
    fragment Department on ComponentElementsDepartment {
  name
  text
  phone
  email
  hours
  schedule {
    days
    from
    to
    closed
  }
  showInFooter
  link {
    ...Link
  }
}
    fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"Department"}) as unknown as TypedDocumentString<DepartmentFragment, unknown>;
export const ContactBlockFragmentDoc = new TypedDocumentString(`
    fragment ContactBlock on ComponentBlocksContact {
  id
  header {
    ...SectionHeader
  }
  showCompany
  contactImage: image {
    ...Media
  }
  formTopics {
    text
  }
  departments {
    ...Department
  }
  section {
    ...Section
  }
}
    fragment Department on ComponentElementsDepartment {
  name
  text
  phone
  email
  hours
  schedule {
    days
    from
    to
    closed
  }
  showInFooter
  link {
    ...Link
  }
}
fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"ContactBlock"}) as unknown as TypedDocumentString<ContactBlockFragment, unknown>;
export const CtaFragmentDoc = new TypedDocumentString(`
    fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}
    fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"Cta"}) as unknown as TypedDocumentString<CtaFragment, unknown>;
export const ContentBlockFragmentDoc = new TypedDocumentString(`
    fragment ContentBlock on ComponentBlocksContent {
  id
  header {
    ...SectionHeader
  }
  body
  align
  collapsible
  previewParagraphs
  collapsedLabel
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}`, {"fragmentName":"ContentBlock"}) as unknown as TypedDocumentString<ContentBlockFragment, unknown>;
export const MediaTextBlockFragmentDoc = new TypedDocumentString(`
    fragment MediaTextBlock on ComponentBlocksMediaText {
  id
  header {
    ...SectionHeader
  }
  body
  image {
    ...Media
  }
  imagePosition
  imageStyle
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}`, {"fragmentName":"MediaTextBlock"}) as unknown as TypedDocumentString<MediaTextBlockFragment, unknown>;
export const ReviewsBlockFragmentDoc = new TypedDocumentString(`
    fragment ReviewsBlock on ComponentBlocksReviews {
  id
  header {
    ...SectionHeader
  }
  limit
  reviewSource: source
  reviewsLayout: layout
  showSummary
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"ReviewsBlock"}) as unknown as TypedDocumentString<ReviewsBlockFragment, unknown>;
export const LocationsBlockFragmentDoc = new TypedDocumentString(`
    fragment LocationsBlock on ComponentBlocksLocations {
  id
  header {
    ...SectionHeader
  }
  locationsFilter: filter
  locationsLayout: layout
  city
  showMap
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"LocationsBlock"}) as unknown as TypedDocumentString<LocationsBlockFragment, unknown>;
export const FeaturesBlockFragmentDoc = new TypedDocumentString(`
    fragment FeaturesBlock on ComponentBlocksFeatures {
  id
  heading: title
  variant
  items {
    title
    text
    icon
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
  }
}
    fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"FeaturesBlock"}) as unknown as TypedDocumentString<FeaturesBlockFragment, unknown>;
export const FaqBlockFragmentDoc = new TypedDocumentString(`
    fragment FaqBlock on ComponentBlocksFaq {
  id
  header {
    ...SectionHeader
  }
  items {
    question
    answer
    category {
      documentId
      name
      slug
      icon
      order
    }
  }
  structuredData
  groupByCategory
  faqCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
    fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"FaqBlock"}) as unknown as TypedDocumentString<FaqBlockFragment, unknown>;
export const BlogCardFragmentDoc = new TypedDocumentString(`
    fragment BlogCard on Blog {
  documentId
  title
  slug
  excerpt
  publishedAt
  createdAt
  category {
    documentId
    name
    color
  }
  coverImage {
    ...Media
  }
}
    fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"BlogCard"}) as unknown as TypedDocumentString<BlogCardFragment, unknown>;
export const BlogPostsBlockFragmentDoc = new TypedDocumentString(`
    fragment BlogPostsBlock on ComponentBlocksBlogPosts {
  id
  badge
  title
  subtitle
  source
  limit
  category {
    documentId
  }
  posts {
    ...BlogCard
  }
  cta {
    ...Cta
  }
}
    fragment BlogCard on Blog {
  documentId
  title
  slug
  excerpt
  publishedAt
  createdAt
  category {
    documentId
    name
    color
  }
  coverImage {
    ...Media
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}`, {"fragmentName":"BlogPostsBlock"}) as unknown as TypedDocumentString<BlogPostsBlockFragment, unknown>;
export const PartLinkFragmentDoc = new TypedDocumentString(`
    fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
    `, {"fragmentName":"PartLink"}) as unknown as TypedDocumentString<PartLinkFragment, unknown>;
export const PartCtaFragmentDoc = new TypedDocumentString(`
    fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
    fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`, {"fragmentName":"PartCta"}) as unknown as TypedDocumentString<PartCtaFragment, unknown>;
export const HeroSectionFragmentDoc = new TypedDocumentString(`
    fragment HeroSection on ComponentSectionsHero {
  id
  badge
  title
  subtitle
  ctas {
    ...PartCta
  }
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
  video {
    ...Media
  }
  videoMobile {
    ...Media
  }
  overlay
  search
  searchTerm
  searchSide
  width
  spacing
  align
}
    fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"HeroSection"}) as unknown as TypedDocumentString<HeroSectionFragment, unknown>;
export const SectionBackgroundFragmentDoc = new TypedDocumentString(`
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
    fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"SectionBackground"}) as unknown as TypedDocumentString<SectionBackgroundFragment, unknown>;
export const FeaturesSectionFragmentDoc = new TypedDocumentString(`
    fragment FeaturesSection on ComponentSectionsFeatures {
  id
  badge
  featuresTitle: title
  text
  headerAlign
  items {
    icon
    title
    text
  }
  variant
  display
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  featuresWidth: width
  featuresSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"FeaturesSection"}) as unknown as TypedDocumentString<FeaturesSectionFragment, unknown>;
export const TextSectionFragmentDoc = new TypedDocumentString(`
    fragment TextSection on ComponentSectionsText {
  id
  badge
  textTitle: title
  body
  textAlign: align
  textWidth
  collapsible
  previewParagraphs
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  textFrameWidth: width
  textSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"TextSection"}) as unknown as TypedDocumentString<TextSectionFragment, unknown>;
export const FaqSectionFragmentDoc = new TypedDocumentString(`
    fragment FaqSection on ComponentSectionsFaq {
  id
  badge
  faqTitle: title
  faqText: text
  faqHeaderAlign: headerAlign
  groups {
    title
    icon
    items {
      question
      answer
    }
  }
  faqSearch: search
  structuredData
  ctas {
    ...PartCta
  }
  faqTextWidth: textWidth
  background {
    ...SectionBackground
  }
  faqWidth: width
  faqSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"FaqSection"}) as unknown as TypedDocumentString<FaqSectionFragment, unknown>;
export const PartCardFragmentDoc = new TypedDocumentString(`
    fragment PartCard on ComponentPartsCard {
  icon
  title
  text
  link {
    ...PartLink
  }
  tone
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
  pattern
}
    fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"PartCard"}) as unknown as TypedDocumentString<PartCardFragment, unknown>;
export const CardsSectionFragmentDoc = new TypedDocumentString(`
    fragment CardsSection on ComponentSectionsCards {
  id
  badge
  cardsTitle: title
  cardsText: text
  cardsHeaderAlign: headerAlign
  cards {
    ...PartCard
  }
  cardsDisplay: display
  visibleCards
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  cardsWidth: width
  cardsSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment PartCard on ComponentPartsCard {
  icon
  title
  text
  link {
    ...PartLink
  }
  tone
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
  pattern
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"CardsSection"}) as unknown as TypedDocumentString<CardsSectionFragment, unknown>;
export const BlogSectionFragmentDoc = new TypedDocumentString(`
    fragment BlogSection on ComponentSectionsBlog {
  id
  badge
  blogTitle: title
  blogText: text
  blogHeaderAlign: headerAlign
  blogSource: source
  posts {
    ...BlogCard
  }
  blogLayout: layout
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  blogWidth: width
  blogSpacing: spacing
}
    fragment BlogCard on Blog {
  documentId
  title
  slug
  excerpt
  publishedAt
  createdAt
  category {
    documentId
    name
    color
  }
  coverImage {
    ...Media
  }
}
fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"BlogSection"}) as unknown as TypedDocumentString<BlogSectionFragment, unknown>;
export const SocialSectionFragmentDoc = new TypedDocumentString(`
    fragment SocialSection on ComponentSectionsSocial {
  id
  badge
  socialTitle: title
  socialText: text
  socialLayout: layout
  showContact
  background {
    ...SectionBackground
  }
  socialWidth: width
  socialSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"SocialSection"}) as unknown as TypedDocumentString<SocialSectionFragment, unknown>;
export const CarCollectionFragmentDoc = new TypedDocumentString(`
    fragment CarCollection on CarCollection {
  documentId
  title
  segmentIds
  categories
  fuels
  bodies
  gearboxes
  minSeats
  onlyPromotion
  onlyPopular
  sort
}
    `, {"fragmentName":"CarCollection"}) as unknown as TypedDocumentString<CarCollectionFragment, unknown>;
export const CarsSectionFragmentDoc = new TypedDocumentString(`
    fragment CarsSection on ComponentSectionsCars {
  id
  badge
  carsTitle: title
  carsText: text
  carsHeaderAlign: headerAlign
  carsSource: source
  carsCategory: category
  segmentIds
  carIds
  collection {
    ...CarCollection
  }
  carsLayout: layout
  limit
  moreCard {
    ...PartCard
  }
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  carsWidth: width
  carsSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment CarCollection on CarCollection {
  documentId
  title
  segmentIds
  categories
  fuels
  bodies
  gearboxes
  minSeats
  onlyPromotion
  onlyPopular
  sort
}
fragment PartCard on ComponentPartsCard {
  icon
  title
  text
  link {
    ...PartLink
  }
  tone
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
  pattern
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"CarsSection"}) as unknown as TypedDocumentString<CarsSectionFragment, unknown>;
export const CarClassesSectionFragmentDoc = new TypedDocumentString(`
    fragment CarClassesSection on ComponentSectionsCarClasses {
  id
  badge
  carClassesTitle: title
  carClassesText: text
  carClassesHeaderAlign: headerAlign
  carClassesSource: source
  carClassesCategories: categories
  collections {
    collection {
      ...CarCollection
    }
    link {
      ...PartLink
    }
  }
  carClassesLayout: layout
  moreCard {
    ...PartCard
  }
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  carClassesWidth: width
  carClassesSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment CarCollection on CarCollection {
  documentId
  title
  segmentIds
  categories
  fuels
  bodies
  gearboxes
  minSeats
  onlyPromotion
  onlyPopular
  sort
}
fragment PartCard on ComponentPartsCard {
  icon
  title
  text
  link {
    ...PartLink
  }
  tone
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
  pattern
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"CarClassesSection"}) as unknown as TypedDocumentString<CarClassesSectionFragment, unknown>;
export const ExtrasSectionFragmentDoc = new TypedDocumentString(`
    fragment ExtrasSection on ComponentSectionsExtras {
  id
  badge
  extrasTitle: title
  extrasText: text
  extrasHeaderAlign: headerAlign
  extrasGroup: group
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  extrasWidth: width
  extrasSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"ExtrasSection"}) as unknown as TypedDocumentString<ExtrasSectionFragment, unknown>;
export const MapSectionFragmentDoc = new TypedDocumentString(`
    fragment MapSection on ComponentSectionsMap {
  id
  badge
  mapTitle: title
  mapText: text
  mapHeaderAlign: headerAlign
  showList
  fullBleed
  mapShowLegend: showLegend
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  mapWidth: width
  mapSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"MapSection"}) as unknown as TypedDocumentString<MapSectionFragment, unknown>;
export const SectionReviewFragmentDoc = new TypedDocumentString(`
    fragment SectionReview on Rating {
  documentId
  name
  rate
  text
}
    `, {"fragmentName":"SectionReview"}) as unknown as TypedDocumentString<SectionReviewFragment, unknown>;
export const ReviewsSectionFragmentDoc = new TypedDocumentString(`
    fragment ReviewsSection on ComponentSectionsReviews {
  id
  badge
  reviewsTitle: title
  reviewsText: text
  reviewsHeaderAlign: headerAlign
  reviewsSource: source
  reviewsLimit: limit
  ratings {
    ...SectionReview
  }
  reviewsLayout: layout
  showScore
  score
  scoreLabel
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  reviewsWidth: width
  reviewsSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment SectionReview on Rating {
  documentId
  name
  rate
  text
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"ReviewsSection"}) as unknown as TypedDocumentString<ReviewsSectionFragment, unknown>;
export const ImageSectionFragmentDoc = new TypedDocumentString(`
    fragment ImageSection on ComponentSectionsImage {
  id
  picture: image {
    ...Media
  }
  pictureMobile: imageMobile {
    ...Media
  }
  imageSize: size
  caption
  background {
    ...SectionBackground
  }
  imageSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"ImageSection"}) as unknown as TypedDocumentString<ImageSectionFragment, unknown>;
export const DividerSectionFragmentDoc = new TypedDocumentString(`
    fragment DividerSection on ComponentSectionsDivider {
  id
  dividerStyle: style
  dividerSize: size
  dividerTone: tone
  dividerDirection: direction
}
    `, {"fragmentName":"DividerSection"}) as unknown as TypedDocumentString<DividerSectionFragment, unknown>;
export const SplitSectionFragmentDoc = new TypedDocumentString(`
    fragment SplitSection on ComponentSectionsSplit {
  id
  splitMedia: media
  splitShowLegend: showLegend
  splitImage: image {
    ...Media
  }
  imageFit
  imageStyle
  imageSecond {
    ...Media
  }
  statValue
  statLabel
  badge
  splitTitle: title
  splitText: text
  content
  splitBody: body
  features {
    icon
    title
    text
  }
  faqs {
    question
    answer
  }
  splitStructuredData: structuredData
  mediaSide
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  splitWidth: width
  splitSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"SplitSection"}) as unknown as TypedDocumentString<SplitSectionFragment, unknown>;
export const FormSectionFragmentDoc = new TypedDocumentString(`
    fragment FormSection on ComponentSectionsForm {
  id
  badge
  formTitle: title
  formText: text
  formHeaderAlign: headerAlign
  formKind
  formWidth
  background {
    ...SectionBackground
  }
  formFrameWidth: width
  formSpacing: spacing
}
    fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`, {"fragmentName":"FormSection"}) as unknown as TypedDocumentString<FormSectionFragment, unknown>;
export const TrustBarBlockFragmentDoc = new TypedDocumentString(`
    fragment TrustBarBlock on ComponentBlocksTrustBar {
  id
  trustVariant: variant
  showRating
  stats {
    kind
  }
  claims {
    icon
    text
  }
}
    `, {"fragmentName":"TrustBarBlock"}) as unknown as TypedDocumentString<TrustBarBlockFragment, unknown>;
export const HeroBlockFragmentDoc = new TypedDocumentString(`
    fragment HeroBlock on ComponentBlocksHero {
  id
  badge
  title
  subtitle
  ctas {
    ...Cta
  }
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  backgroundVideo {
    ...Media
  }
  overlay
  height
  reservationLayout
  reservationDefaultTerm
  highlights {
    icon
    text
  }
  heroLayout: layout
  searchSide
  focalPoint
  breadcrumbLabel
  trust {
    ...TrustBarBlock
  }
}
    fragment TrustBarBlock on ComponentBlocksTrustBar {
  id
  trustVariant: variant
  showRating
  stats {
    kind
  }
  claims {
    icon
    text
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}`, {"fragmentName":"HeroBlock"}) as unknown as TypedDocumentString<HeroBlockFragment, unknown>;
export const BlogRoutesDocument = new TypedDocumentString(`
    query BlogRoutes($locale: I18NLocaleCode!, $status: PublicationStatus!, $page: Int!, $pageSize: Int!) {
  blogs_connection(
    locale: $locale
    status: $status
    sort: "id"
    pagination: {page: $page, pageSize: $pageSize}
  ) {
    nodes {
      documentId
      slug
      updatedAt
    }
    pageInfo {
      page
      pageCount
    }
  }
}
    `) as unknown as TypedDocumentString<BlogRoutesQuery, BlogRoutesQueryVariables>;
export const BlogPostDocument = new TypedDocumentString(`
    query BlogPost($documentId: ID!, $locale: I18NLocaleCode!, $status: PublicationStatus!) {
  blog(documentId: $documentId, locale: $locale, status: $status) {
    ...BlogCard
    updatedAt
    seo {
      metaTitle
      metaDescription
      noIndex
      noFollow
      shareImage {
        ...Media
      }
    }
    blocks {
      __typename
      ... on ComponentBlocksHero {
        ...HeroBlock
      }
      ... on ComponentBlocksContent {
        ...ContentBlock
      }
      ... on ComponentBlocksMediaText {
        ...MediaTextBlock
      }
      ... on ComponentBlocksFeatures {
        ...FeaturesBlock
      }
      ... on ComponentBlocksFaq {
        ...FaqBlock
      }
      ... on ComponentBlocksReviews {
        ...ReviewsBlock
      }
      ... on ComponentBlocksLocations {
        ...LocationsBlock
      }
      ... on ComponentBlocksBlogPosts {
        ...BlogPostsBlock
      }
      ... on ComponentBlocksScenarios {
        ...ScenariosBlock
      }
      ... on ComponentBlocksComparison {
        ...ComparisonBlock
      }
      ... on ComponentBlocksCars {
        ...CarsBlock
      }
      ... on ComponentBlocksLogos {
        ...LogosBlock
      }
      ... on ComponentBlocksLeadForm {
        ...LeadFormBlock
      }
      ... on ComponentBlocksCtaBand {
        ...CtaBandBlock
      }
      ... on ComponentBlocksTrustBar {
        ...TrustBarBlock
      }
      ... on ComponentBlocksContact {
        ...ContactBlock
      }
      ... on ComponentBlocksPromoCards {
        ...PromoCardsBlock
      }
    }
  }
}
    fragment ScenariosBlock on ComponentBlocksScenarios {
  id
  header {
    ...SectionHeader
  }
  scenariosLayout: layout
  items {
    label
    title
    audience
    text
    benefits {
      text
    }
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    cta {
      ...Link
    }
  }
  section {
    ...Section
  }
}
fragment ComparisonBlock on ComponentBlocksComparison {
  id
  header {
    ...SectionHeader
  }
  columns {
    label
    highlighted
  }
  rows {
    criterion
    values {
      kind
      text
    }
  }
  footnote
  section {
    ...Section
  }
}
fragment CarsBlock on ComponentBlocksCars {
  id
  header {
    ...SectionHeader
  }
  carsSource: source
  segmentIds
  carsCategory: category
  limit
  carsLayout: layout
  defaultCategory
  onlyPromotions
  carsCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
fragment LogosBlock on ComponentBlocksLogos {
  id
  header {
    ...SectionHeader
  }
  logos: items {
    name
    image {
      ...Media
    }
  }
  section {
    ...Section
  }
}
fragment LeadFormBlock on ComponentBlocksLeadForm {
  id
  header {
    ...SectionHeader
  }
  formVariant: variant
  contactTitle
  contactText
  steps {
    text
  }
  consent
  successTitle
  successText
  section {
    ...Section
  }
}
fragment CtaBandBlock on ComponentBlocksCtaBand {
  id
  title
  text
  primary {
    ...Link
  }
  secondary {
    ...Link
  }
  tone
  ctaVariant: variant
  eyebrow
  ctaImage: image {
    ...Media
  }
  ctaImageMobile: imageMobile {
    ...Media
  }
  media {
    ...Media
  }
  showStoreBadges
}
fragment Department on ComponentElementsDepartment {
  name
  text
  phone
  email
  hours
  schedule {
    days
    from
    to
    closed
  }
  showInFooter
  link {
    ...Link
  }
}
fragment PromoCardsBlock on ComponentBlocksPromoCards {
  id
  header {
    ...SectionHeader
  }
  promos: items {
    title
    text
    code
    validFrom
    validUntil
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
    termsLink {
      ...Link
    }
  }
  section {
    ...Section
  }
}
fragment TrustBarBlock on ComponentBlocksTrustBar {
  id
  trustVariant: variant
  showRating
  stats {
    kind
  }
  claims {
    icon
    text
  }
}
fragment ContactBlock on ComponentBlocksContact {
  id
  header {
    ...SectionHeader
  }
  showCompany
  contactImage: image {
    ...Media
  }
  formTopics {
    text
  }
  departments {
    ...Department
  }
  section {
    ...Section
  }
}
fragment ContentBlock on ComponentBlocksContent {
  id
  header {
    ...SectionHeader
  }
  body
  align
  collapsible
  previewParagraphs
  collapsedLabel
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
fragment MediaTextBlock on ComponentBlocksMediaText {
  id
  header {
    ...SectionHeader
  }
  body
  image {
    ...Media
  }
  imagePosition
  imageStyle
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
fragment ReviewsBlock on ComponentBlocksReviews {
  id
  header {
    ...SectionHeader
  }
  limit
  reviewSource: source
  reviewsLayout: layout
  showSummary
  section {
    ...Section
  }
}
fragment LocationsBlock on ComponentBlocksLocations {
  id
  header {
    ...SectionHeader
  }
  locationsFilter: filter
  locationsLayout: layout
  city
  showMap
  section {
    ...Section
  }
}
fragment FeaturesBlock on ComponentBlocksFeatures {
  id
  heading: title
  variant
  items {
    title
    text
    icon
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
  }
}
fragment FaqBlock on ComponentBlocksFaq {
  id
  header {
    ...SectionHeader
  }
  items {
    question
    answer
    category {
      documentId
      name
      slug
      icon
      order
    }
  }
  structuredData
  groupByCategory
  faqCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment BlogCard on Blog {
  documentId
  title
  slug
  excerpt
  publishedAt
  createdAt
  category {
    documentId
    name
    color
  }
  coverImage {
    ...Media
  }
}
fragment BlogPostsBlock on ComponentBlocksBlogPosts {
  id
  badge
  title
  subtitle
  source
  limit
  category {
    documentId
  }
  posts {
    ...BlogCard
  }
  cta {
    ...Cta
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}
fragment HeroBlock on ComponentBlocksHero {
  id
  badge
  title
  subtitle
  ctas {
    ...Cta
  }
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  backgroundVideo {
    ...Media
  }
  overlay
  height
  reservationLayout
  reservationDefaultTerm
  highlights {
    icon
    text
  }
  heroLayout: layout
  searchSide
  focalPoint
  breadcrumbLabel
  trust {
    ...TrustBarBlock
  }
}`) as unknown as TypedDocumentString<BlogPostQuery, BlogPostQueryVariables>;
export const ChromeDocument = new TypedDocumentString(`
    query Chrome($locale: I18NLocaleCode!, $status: PublicationStatus!) {
  layout(locale: $locale, status: $status) {
    header {
      label
      submenu
      link {
        ...Link
      }
      links {
        ...Link
      }
    }
    footerGroups {
      title
      links {
        ...Link
      }
    }
    headerCta {
      ...Link
    }
    footerText
    legalLinks {
      ...Link
    }
    paymentMethods {
      method
    }
    companyName
    legalText
  }
  announcement(locale: $locale, status: $status) {
    documentId
    updatedAt
    enabled
    text
    variant
    link {
      ...Link
    }
    startsAt
    endsAt
    closable
  }
  site(locale: $locale, status: $status) {
    seo {
      ...Seo
    }
    contact {
      phone
      email
      address
      openingHours
      availabilityNote
      whatsapp
      chatUrl
      hours {
        days
        from
        to
        closed
      }
      legalName
      nip
      regon
      krs
      mapUrl
      departments {
        ...Department
      }
    }
    appStoreUrl
    googlePlayUrl
    social {
      platform
      url
    }
  }
}
    fragment Seo on ComponentElementsSeo {
  metaTitle
  metaDescription
  keywords
  noIndex
  noFollow
  shareImage {
    ...Media
  }
}
fragment Department on ComponentElementsDepartment {
  name
  text
  phone
  email
  hours
  schedule {
    days
    from
    to
    closed
  }
  showInFooter
  link {
    ...Link
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}`) as unknown as TypedDocumentString<ChromeQuery, ChromeQueryVariables>;
export const LatestPostsDocument = new TypedDocumentString(`
    query LatestPosts($locale: I18NLocaleCode!, $status: PublicationStatus!, $limit: Int!) {
  blogs(
    locale: $locale
    status: $status
    sort: ["createdAt:desc", "publishedAt:desc"]
    pagination: {limit: $limit}
  ) {
    documentId
    title
    slug
    coverImage {
      ...Media
    }
  }
}
    fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`) as unknown as TypedDocumentString<LatestPostsQuery, LatestPostsQueryVariables>;
export const DocumentFileDocument = new TypedDocumentString(`
    query DocumentFile($slug: String!, $locale: I18NLocaleCode!, $status: PublicationStatus!) {
  regulations(
    filters: {slug: {eq: $slug}}
    locale: $locale
    status: $status
    pagination: {limit: 1}
  ) {
    file {
      url
    }
  }
}
    `) as unknown as TypedDocumentString<DocumentFileQuery, DocumentFileQueryVariables>;
export const PageDocument = new TypedDocumentString(`
    query Page($documentId: ID!, $locale: I18NLocaleCode!, $status: PublicationStatus!) {
  page(documentId: $documentId, locale: $locale, status: $status) {
    documentId
    title
    seo {
      metaTitle
      metaDescription
      noIndex
      noFollow
      shareImage {
        ...Media
      }
    }
    sections {
      __typename
      ... on ComponentSectionsHero {
        ...HeroSection
      }
      ... on ComponentSectionsFeatures {
        ...FeaturesSection
      }
      ... on ComponentSectionsText {
        ...TextSection
      }
      ... on ComponentSectionsFaq {
        ...FaqSection
      }
      ... on ComponentSectionsCards {
        ...CardsSection
      }
      ... on ComponentSectionsBlog {
        ...BlogSection
      }
      ... on ComponentSectionsSocial {
        ...SocialSection
      }
      ... on ComponentSectionsCars {
        ...CarsSection
      }
      ... on ComponentSectionsCarClasses {
        ...CarClassesSection
      }
      ... on ComponentSectionsExtras {
        ...ExtrasSection
      }
      ... on ComponentSectionsMap {
        ...MapSection
      }
      ... on ComponentSectionsSplit {
        ...SplitSection
      }
      ... on ComponentSectionsForm {
        ...FormSection
      }
      ... on ComponentSectionsReviews {
        ...ReviewsSection
      }
      ... on ComponentSectionsImage {
        ...ImageSection
      }
      ... on ComponentSectionsDivider {
        ...DividerSection
      }
      ... on ComponentSectionsVariantLabel {
        id
        title
        note
      }
    }
    blocks {
      __typename
      ... on ComponentBlocksHero {
        ...HeroBlock
      }
      ... on ComponentBlocksContent {
        ...ContentBlock
      }
      ... on ComponentBlocksMediaText {
        ...MediaTextBlock
      }
      ... on ComponentBlocksFeatures {
        ...FeaturesBlock
      }
      ... on ComponentBlocksFaq {
        ...FaqBlock
      }
      ... on ComponentBlocksReviews {
        ...ReviewsBlock
      }
      ... on ComponentBlocksLocations {
        ...LocationsBlock
      }
      ... on ComponentBlocksBlogPosts {
        ...BlogPostsBlock
      }
      ... on ComponentBlocksScenarios {
        ...ScenariosBlock
      }
      ... on ComponentBlocksComparison {
        ...ComparisonBlock
      }
      ... on ComponentBlocksCars {
        ...CarsBlock
      }
      ... on ComponentBlocksLogos {
        ...LogosBlock
      }
      ... on ComponentBlocksLeadForm {
        ...LeadFormBlock
      }
      ... on ComponentBlocksCtaBand {
        ...CtaBandBlock
      }
      ... on ComponentBlocksTrustBar {
        ...TrustBarBlock
      }
      ... on ComponentBlocksContact {
        ...ContactBlock
      }
      ... on ComponentBlocksPromoCards {
        ...PromoCardsBlock
      }
    }
  }
}
    fragment ScenariosBlock on ComponentBlocksScenarios {
  id
  header {
    ...SectionHeader
  }
  scenariosLayout: layout
  items {
    label
    title
    audience
    text
    benefits {
      text
    }
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    cta {
      ...Link
    }
  }
  section {
    ...Section
  }
}
fragment ComparisonBlock on ComponentBlocksComparison {
  id
  header {
    ...SectionHeader
  }
  columns {
    label
    highlighted
  }
  rows {
    criterion
    values {
      kind
      text
    }
  }
  footnote
  section {
    ...Section
  }
}
fragment CarsBlock on ComponentBlocksCars {
  id
  header {
    ...SectionHeader
  }
  carsSource: source
  segmentIds
  carsCategory: category
  limit
  carsLayout: layout
  defaultCategory
  onlyPromotions
  carsCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
fragment LogosBlock on ComponentBlocksLogos {
  id
  header {
    ...SectionHeader
  }
  logos: items {
    name
    image {
      ...Media
    }
  }
  section {
    ...Section
  }
}
fragment LeadFormBlock on ComponentBlocksLeadForm {
  id
  header {
    ...SectionHeader
  }
  formVariant: variant
  contactTitle
  contactText
  steps {
    text
  }
  consent
  successTitle
  successText
  section {
    ...Section
  }
}
fragment CtaBandBlock on ComponentBlocksCtaBand {
  id
  title
  text
  primary {
    ...Link
  }
  secondary {
    ...Link
  }
  tone
  ctaVariant: variant
  eyebrow
  ctaImage: image {
    ...Media
  }
  ctaImageMobile: imageMobile {
    ...Media
  }
  media {
    ...Media
  }
  showStoreBadges
}
fragment Department on ComponentElementsDepartment {
  name
  text
  phone
  email
  hours
  schedule {
    days
    from
    to
    closed
  }
  showInFooter
  link {
    ...Link
  }
}
fragment PromoCardsBlock on ComponentBlocksPromoCards {
  id
  header {
    ...SectionHeader
  }
  promos: items {
    title
    text
    code
    validFrom
    validUntil
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
    termsLink {
      ...Link
    }
  }
  section {
    ...Section
  }
}
fragment TrustBarBlock on ComponentBlocksTrustBar {
  id
  trustVariant: variant
  showRating
  stats {
    kind
  }
  claims {
    icon
    text
  }
}
fragment ContactBlock on ComponentBlocksContact {
  id
  header {
    ...SectionHeader
  }
  showCompany
  contactImage: image {
    ...Media
  }
  formTopics {
    text
  }
  departments {
    ...Department
  }
  section {
    ...Section
  }
}
fragment ContentBlock on ComponentBlocksContent {
  id
  header {
    ...SectionHeader
  }
  body
  align
  collapsible
  previewParagraphs
  collapsedLabel
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
fragment MediaTextBlock on ComponentBlocksMediaText {
  id
  header {
    ...SectionHeader
  }
  body
  image {
    ...Media
  }
  imagePosition
  imageStyle
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
fragment ReviewsBlock on ComponentBlocksReviews {
  id
  header {
    ...SectionHeader
  }
  limit
  reviewSource: source
  reviewsLayout: layout
  showSummary
  section {
    ...Section
  }
}
fragment LocationsBlock on ComponentBlocksLocations {
  id
  header {
    ...SectionHeader
  }
  locationsFilter: filter
  locationsLayout: layout
  city
  showMap
  section {
    ...Section
  }
}
fragment FeaturesBlock on ComponentBlocksFeatures {
  id
  heading: title
  variant
  items {
    title
    text
    icon
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
  }
}
fragment FaqBlock on ComponentBlocksFaq {
  id
  header {
    ...SectionHeader
  }
  items {
    question
    answer
    category {
      documentId
      name
      slug
      icon
      order
    }
  }
  structuredData
  groupByCategory
  faqCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment BlogCard on Blog {
  documentId
  title
  slug
  excerpt
  publishedAt
  createdAt
  category {
    documentId
    name
    color
  }
  coverImage {
    ...Media
  }
}
fragment BlogPostsBlock on ComponentBlocksBlogPosts {
  id
  badge
  title
  subtitle
  source
  limit
  category {
    documentId
  }
  posts {
    ...BlogCard
  }
  cta {
    ...Cta
  }
}
fragment HeroSection on ComponentSectionsHero {
  id
  badge
  title
  subtitle
  ctas {
    ...PartCta
  }
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
  video {
    ...Media
  }
  videoMobile {
    ...Media
  }
  overlay
  search
  searchTerm
  searchSide
  width
  spacing
  align
}
fragment SectionBackground on ComponentPartsBackground {
  tone
  pattern
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
}
fragment FeaturesSection on ComponentSectionsFeatures {
  id
  badge
  featuresTitle: title
  text
  headerAlign
  items {
    icon
    title
    text
  }
  variant
  display
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  featuresWidth: width
  featuresSpacing: spacing
}
fragment TextSection on ComponentSectionsText {
  id
  badge
  textTitle: title
  body
  textAlign: align
  textWidth
  collapsible
  previewParagraphs
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  textFrameWidth: width
  textSpacing: spacing
}
fragment FaqSection on ComponentSectionsFaq {
  id
  badge
  faqTitle: title
  faqText: text
  faqHeaderAlign: headerAlign
  groups {
    title
    icon
    items {
      question
      answer
    }
  }
  faqSearch: search
  structuredData
  ctas {
    ...PartCta
  }
  faqTextWidth: textWidth
  background {
    ...SectionBackground
  }
  faqWidth: width
  faqSpacing: spacing
}
fragment CardsSection on ComponentSectionsCards {
  id
  badge
  cardsTitle: title
  cardsText: text
  cardsHeaderAlign: headerAlign
  cards {
    ...PartCard
  }
  cardsDisplay: display
  visibleCards
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  cardsWidth: width
  cardsSpacing: spacing
}
fragment BlogSection on ComponentSectionsBlog {
  id
  badge
  blogTitle: title
  blogText: text
  blogHeaderAlign: headerAlign
  blogSource: source
  posts {
    ...BlogCard
  }
  blogLayout: layout
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  blogWidth: width
  blogSpacing: spacing
}
fragment SocialSection on ComponentSectionsSocial {
  id
  badge
  socialTitle: title
  socialText: text
  socialLayout: layout
  showContact
  background {
    ...SectionBackground
  }
  socialWidth: width
  socialSpacing: spacing
}
fragment CarsSection on ComponentSectionsCars {
  id
  badge
  carsTitle: title
  carsText: text
  carsHeaderAlign: headerAlign
  carsSource: source
  carsCategory: category
  segmentIds
  carIds
  collection {
    ...CarCollection
  }
  carsLayout: layout
  limit
  moreCard {
    ...PartCard
  }
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  carsWidth: width
  carsSpacing: spacing
}
fragment CarCollection on CarCollection {
  documentId
  title
  segmentIds
  categories
  fuels
  bodies
  gearboxes
  minSeats
  onlyPromotion
  onlyPopular
  sort
}
fragment CarClassesSection on ComponentSectionsCarClasses {
  id
  badge
  carClassesTitle: title
  carClassesText: text
  carClassesHeaderAlign: headerAlign
  carClassesSource: source
  carClassesCategories: categories
  collections {
    collection {
      ...CarCollection
    }
    link {
      ...PartLink
    }
  }
  carClassesLayout: layout
  moreCard {
    ...PartCard
  }
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  carClassesWidth: width
  carClassesSpacing: spacing
}
fragment ExtrasSection on ComponentSectionsExtras {
  id
  badge
  extrasTitle: title
  extrasText: text
  extrasHeaderAlign: headerAlign
  extrasGroup: group
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  extrasWidth: width
  extrasSpacing: spacing
}
fragment MapSection on ComponentSectionsMap {
  id
  badge
  mapTitle: title
  mapText: text
  mapHeaderAlign: headerAlign
  showList
  fullBleed
  mapShowLegend: showLegend
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  mapWidth: width
  mapSpacing: spacing
}
fragment ReviewsSection on ComponentSectionsReviews {
  id
  badge
  reviewsTitle: title
  reviewsText: text
  reviewsHeaderAlign: headerAlign
  reviewsSource: source
  reviewsLimit: limit
  ratings {
    ...SectionReview
  }
  reviewsLayout: layout
  showScore
  score
  scoreLabel
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  reviewsWidth: width
  reviewsSpacing: spacing
}
fragment SectionReview on Rating {
  documentId
  name
  rate
  text
}
fragment ImageSection on ComponentSectionsImage {
  id
  picture: image {
    ...Media
  }
  pictureMobile: imageMobile {
    ...Media
  }
  imageSize: size
  caption
  background {
    ...SectionBackground
  }
  imageSpacing: spacing
}
fragment DividerSection on ComponentSectionsDivider {
  id
  dividerStyle: style
  dividerSize: size
  dividerTone: tone
  dividerDirection: direction
}
fragment SplitSection on ComponentSectionsSplit {
  id
  splitMedia: media
  splitShowLegend: showLegend
  splitImage: image {
    ...Media
  }
  imageFit
  imageStyle
  imageSecond {
    ...Media
  }
  statValue
  statLabel
  badge
  splitTitle: title
  splitText: text
  content
  splitBody: body
  features {
    icon
    title
    text
  }
  faqs {
    question
    answer
  }
  splitStructuredData: structuredData
  mediaSide
  ctas {
    ...PartCta
  }
  background {
    ...SectionBackground
  }
  splitWidth: width
  splitSpacing: spacing
}
fragment FormSection on ComponentSectionsForm {
  id
  badge
  formTitle: title
  formText: text
  formHeaderAlign: headerAlign
  formKind
  formWidth
  background {
    ...SectionBackground
  }
  formFrameWidth: width
  formSpacing: spacing
}
fragment PartCard on ComponentPartsCard {
  icon
  title
  text
  link {
    ...PartLink
  }
  tone
  image {
    ...Media
  }
  imageMobile {
    ...Media
  }
  pattern
}
fragment PartLink on ComponentPartsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment PartCta on ComponentPartsCta {
  variant
  icon
  link {
    ...PartLink
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}
fragment HeroBlock on ComponentBlocksHero {
  id
  badge
  title
  subtitle
  ctas {
    ...Cta
  }
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  backgroundVideo {
    ...Media
  }
  overlay
  height
  reservationLayout
  reservationDefaultTerm
  highlights {
    icon
    text
  }
  heroLayout: layout
  searchSide
  focalPoint
  breadcrumbLabel
  trust {
    ...TrustBarBlock
  }
}`) as unknown as TypedDocumentString<PageQuery, PageQueryVariables>;
export const SectionReviewsDocument = new TypedDocumentString(`
    query SectionReviews($locale: I18NLocaleCode!, $status: PublicationStatus!, $limit: Int!) {
  ratings(
    locale: $locale
    status: $status
    sort: ["date:desc", "documentId:asc"]
    pagination: {limit: $limit}
  ) {
    ...SectionReview
  }
}
    fragment SectionReview on Rating {
  documentId
  name
  rate
  text
}`) as unknown as TypedDocumentString<SectionReviewsQuery, SectionReviewsQueryVariables>;
export const ReviewsDocument = new TypedDocumentString(`
    query Reviews($status: PublicationStatus!) {
  ratings(status: $status, sort: ["date:desc"], pagination: {limit: 100}) {
    documentId
    name
    rate
    text
    date
    source
  }
}
    `) as unknown as TypedDocumentString<ReviewsQuery, ReviewsQueryVariables>;
export const BlogCardsDocument = new TypedDocumentString(`
    query BlogCards($locale: I18NLocaleCode!, $status: PublicationStatus!, $limit: Int!, $filters: BlogFiltersInput) {
  blogs(
    locale: $locale
    status: $status
    filters: $filters
    sort: ["createdAt:desc", "publishedAt:desc"]
    pagination: {limit: $limit}
  ) {
    ...BlogCard
  }
}
    fragment BlogCard on Blog {
  documentId
  title
  slug
  excerpt
  publishedAt
  createdAt
  category {
    documentId
    name
    color
  }
  coverImage {
    ...Media
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}`) as unknown as TypedDocumentString<BlogCardsQuery, BlogCardsQueryVariables>;
export const PlaceLinksDocument = new TypedDocumentString(`
    query PlaceLinks($locale: I18NLocaleCode!, $status: PublicationStatus!) {
  cities(locale: $locale, status: $status, pagination: {limit: 200}) {
    slug
    title
    kind
    shortName
  }
  localPages(locale: $locale, status: $status, pagination: {limit: 200}) {
    slug
    title: Title
    shortName
  }
}
    `) as unknown as TypedDocumentString<PlaceLinksQuery, PlaceLinksQueryVariables>;
export const CityRoutesDocument = new TypedDocumentString(`
    query CityRoutes($locale: I18NLocaleCode!, $status: PublicationStatus!, $page: Int!, $pageSize: Int!) {
  cities_connection(
    locale: $locale
    status: $status
    sort: "id"
    pagination: {page: $page, pageSize: $pageSize}
  ) {
    nodes {
      documentId
      slug
      updatedAt
    }
    pageInfo {
      page
      pageCount
    }
  }
}
    `) as unknown as TypedDocumentString<CityRoutesQuery, CityRoutesQueryVariables>;
export const LocalPageRoutesDocument = new TypedDocumentString(`
    query LocalPageRoutes($locale: I18NLocaleCode!, $status: PublicationStatus!, $page: Int!, $pageSize: Int!) {
  localPages_connection(
    locale: $locale
    status: $status
    sort: "id"
    pagination: {page: $page, pageSize: $pageSize}
  ) {
    nodes {
      documentId
      slug
      updatedAt
    }
    pageInfo {
      page
      pageCount
    }
  }
}
    `) as unknown as TypedDocumentString<LocalPageRoutesQuery, LocalPageRoutesQueryVariables>;
export const CityDocument = new TypedDocumentString(`
    query City($documentId: ID!, $locale: I18NLocaleCode!, $status: PublicationStatus!) {
  city(documentId: $documentId, locale: $locale, status: $status) {
    documentId
    title
    pickupPoint
    seo {
      metaTitle
      metaDescription
      noIndex
      noFollow
      shareImage {
        ...Media
      }
    }
    blocks {
      __typename
      ... on ComponentBlocksHero {
        ...HeroBlock
      }
      ... on ComponentBlocksContent {
        ...ContentBlock
      }
      ... on ComponentBlocksMediaText {
        ...MediaTextBlock
      }
      ... on ComponentBlocksFeatures {
        ...FeaturesBlock
      }
      ... on ComponentBlocksFaq {
        ...FaqBlock
      }
      ... on ComponentBlocksReviews {
        ...ReviewsBlock
      }
      ... on ComponentBlocksLocations {
        ...LocationsBlock
      }
      ... on ComponentBlocksBlogPosts {
        ...BlogPostsBlock
      }
      ... on ComponentBlocksScenarios {
        ...ScenariosBlock
      }
      ... on ComponentBlocksComparison {
        ...ComparisonBlock
      }
      ... on ComponentBlocksCars {
        ...CarsBlock
      }
      ... on ComponentBlocksLogos {
        ...LogosBlock
      }
      ... on ComponentBlocksLeadForm {
        ...LeadFormBlock
      }
      ... on ComponentBlocksCtaBand {
        ...CtaBandBlock
      }
      ... on ComponentBlocksTrustBar {
        ...TrustBarBlock
      }
      ... on ComponentBlocksContact {
        ...ContactBlock
      }
      ... on ComponentBlocksPromoCards {
        ...PromoCardsBlock
      }
    }
  }
}
    fragment ScenariosBlock on ComponentBlocksScenarios {
  id
  header {
    ...SectionHeader
  }
  scenariosLayout: layout
  items {
    label
    title
    audience
    text
    benefits {
      text
    }
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    cta {
      ...Link
    }
  }
  section {
    ...Section
  }
}
fragment ComparisonBlock on ComponentBlocksComparison {
  id
  header {
    ...SectionHeader
  }
  columns {
    label
    highlighted
  }
  rows {
    criterion
    values {
      kind
      text
    }
  }
  footnote
  section {
    ...Section
  }
}
fragment CarsBlock on ComponentBlocksCars {
  id
  header {
    ...SectionHeader
  }
  carsSource: source
  segmentIds
  carsCategory: category
  limit
  carsLayout: layout
  defaultCategory
  onlyPromotions
  carsCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
fragment LogosBlock on ComponentBlocksLogos {
  id
  header {
    ...SectionHeader
  }
  logos: items {
    name
    image {
      ...Media
    }
  }
  section {
    ...Section
  }
}
fragment LeadFormBlock on ComponentBlocksLeadForm {
  id
  header {
    ...SectionHeader
  }
  formVariant: variant
  contactTitle
  contactText
  steps {
    text
  }
  consent
  successTitle
  successText
  section {
    ...Section
  }
}
fragment CtaBandBlock on ComponentBlocksCtaBand {
  id
  title
  text
  primary {
    ...Link
  }
  secondary {
    ...Link
  }
  tone
  ctaVariant: variant
  eyebrow
  ctaImage: image {
    ...Media
  }
  ctaImageMobile: imageMobile {
    ...Media
  }
  media {
    ...Media
  }
  showStoreBadges
}
fragment Department on ComponentElementsDepartment {
  name
  text
  phone
  email
  hours
  schedule {
    days
    from
    to
    closed
  }
  showInFooter
  link {
    ...Link
  }
}
fragment PromoCardsBlock on ComponentBlocksPromoCards {
  id
  header {
    ...SectionHeader
  }
  promos: items {
    title
    text
    code
    validFrom
    validUntil
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
    termsLink {
      ...Link
    }
  }
  section {
    ...Section
  }
}
fragment TrustBarBlock on ComponentBlocksTrustBar {
  id
  trustVariant: variant
  showRating
  stats {
    kind
  }
  claims {
    icon
    text
  }
}
fragment ContactBlock on ComponentBlocksContact {
  id
  header {
    ...SectionHeader
  }
  showCompany
  contactImage: image {
    ...Media
  }
  formTopics {
    text
  }
  departments {
    ...Department
  }
  section {
    ...Section
  }
}
fragment ContentBlock on ComponentBlocksContent {
  id
  header {
    ...SectionHeader
  }
  body
  align
  collapsible
  previewParagraphs
  collapsedLabel
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
fragment MediaTextBlock on ComponentBlocksMediaText {
  id
  header {
    ...SectionHeader
  }
  body
  image {
    ...Media
  }
  imagePosition
  imageStyle
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
fragment ReviewsBlock on ComponentBlocksReviews {
  id
  header {
    ...SectionHeader
  }
  limit
  reviewSource: source
  reviewsLayout: layout
  showSummary
  section {
    ...Section
  }
}
fragment LocationsBlock on ComponentBlocksLocations {
  id
  header {
    ...SectionHeader
  }
  locationsFilter: filter
  locationsLayout: layout
  city
  showMap
  section {
    ...Section
  }
}
fragment FeaturesBlock on ComponentBlocksFeatures {
  id
  heading: title
  variant
  items {
    title
    text
    icon
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
  }
}
fragment FaqBlock on ComponentBlocksFaq {
  id
  header {
    ...SectionHeader
  }
  items {
    question
    answer
    category {
      documentId
      name
      slug
      icon
      order
    }
  }
  structuredData
  groupByCategory
  faqCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment BlogCard on Blog {
  documentId
  title
  slug
  excerpt
  publishedAt
  createdAt
  category {
    documentId
    name
    color
  }
  coverImage {
    ...Media
  }
}
fragment BlogPostsBlock on ComponentBlocksBlogPosts {
  id
  badge
  title
  subtitle
  source
  limit
  category {
    documentId
  }
  posts {
    ...BlogCard
  }
  cta {
    ...Cta
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}
fragment HeroBlock on ComponentBlocksHero {
  id
  badge
  title
  subtitle
  ctas {
    ...Cta
  }
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  backgroundVideo {
    ...Media
  }
  overlay
  height
  reservationLayout
  reservationDefaultTerm
  highlights {
    icon
    text
  }
  heroLayout: layout
  searchSide
  focalPoint
  breadcrumbLabel
  trust {
    ...TrustBarBlock
  }
}`) as unknown as TypedDocumentString<CityQuery, CityQueryVariables>;
export const LocalPageDocument = new TypedDocumentString(`
    query LocalPage($documentId: ID!, $locale: I18NLocaleCode!, $status: PublicationStatus!) {
  localPage(documentId: $documentId, locale: $locale, status: $status) {
    documentId
    title: Title
    pickupPoint
    seo {
      metaTitle
      metaDescription
      noIndex
      noFollow
      shareImage {
        ...Media
      }
    }
    blocks {
      __typename
      ... on ComponentBlocksHero {
        ...HeroBlock
      }
      ... on ComponentBlocksContent {
        ...ContentBlock
      }
      ... on ComponentBlocksMediaText {
        ...MediaTextBlock
      }
      ... on ComponentBlocksFeatures {
        ...FeaturesBlock
      }
      ... on ComponentBlocksFaq {
        ...FaqBlock
      }
      ... on ComponentBlocksReviews {
        ...ReviewsBlock
      }
      ... on ComponentBlocksLocations {
        ...LocationsBlock
      }
      ... on ComponentBlocksBlogPosts {
        ...BlogPostsBlock
      }
      ... on ComponentBlocksScenarios {
        ...ScenariosBlock
      }
      ... on ComponentBlocksComparison {
        ...ComparisonBlock
      }
      ... on ComponentBlocksCars {
        ...CarsBlock
      }
      ... on ComponentBlocksLogos {
        ...LogosBlock
      }
      ... on ComponentBlocksLeadForm {
        ...LeadFormBlock
      }
      ... on ComponentBlocksCtaBand {
        ...CtaBandBlock
      }
      ... on ComponentBlocksTrustBar {
        ...TrustBarBlock
      }
      ... on ComponentBlocksContact {
        ...ContactBlock
      }
      ... on ComponentBlocksPromoCards {
        ...PromoCardsBlock
      }
    }
  }
}
    fragment ScenariosBlock on ComponentBlocksScenarios {
  id
  header {
    ...SectionHeader
  }
  scenariosLayout: layout
  items {
    label
    title
    audience
    text
    benefits {
      text
    }
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    cta {
      ...Link
    }
  }
  section {
    ...Section
  }
}
fragment ComparisonBlock on ComponentBlocksComparison {
  id
  header {
    ...SectionHeader
  }
  columns {
    label
    highlighted
  }
  rows {
    criterion
    values {
      kind
      text
    }
  }
  footnote
  section {
    ...Section
  }
}
fragment CarsBlock on ComponentBlocksCars {
  id
  header {
    ...SectionHeader
  }
  carsSource: source
  segmentIds
  carsCategory: category
  limit
  carsLayout: layout
  defaultCategory
  onlyPromotions
  carsCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
fragment LogosBlock on ComponentBlocksLogos {
  id
  header {
    ...SectionHeader
  }
  logos: items {
    name
    image {
      ...Media
    }
  }
  section {
    ...Section
  }
}
fragment LeadFormBlock on ComponentBlocksLeadForm {
  id
  header {
    ...SectionHeader
  }
  formVariant: variant
  contactTitle
  contactText
  steps {
    text
  }
  consent
  successTitle
  successText
  section {
    ...Section
  }
}
fragment CtaBandBlock on ComponentBlocksCtaBand {
  id
  title
  text
  primary {
    ...Link
  }
  secondary {
    ...Link
  }
  tone
  ctaVariant: variant
  eyebrow
  ctaImage: image {
    ...Media
  }
  ctaImageMobile: imageMobile {
    ...Media
  }
  media {
    ...Media
  }
  showStoreBadges
}
fragment Department on ComponentElementsDepartment {
  name
  text
  phone
  email
  hours
  schedule {
    days
    from
    to
    closed
  }
  showInFooter
  link {
    ...Link
  }
}
fragment PromoCardsBlock on ComponentBlocksPromoCards {
  id
  header {
    ...SectionHeader
  }
  promos: items {
    title
    text
    code
    validFrom
    validUntil
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
    termsLink {
      ...Link
    }
  }
  section {
    ...Section
  }
}
fragment TrustBarBlock on ComponentBlocksTrustBar {
  id
  trustVariant: variant
  showRating
  stats {
    kind
  }
  claims {
    icon
    text
  }
}
fragment ContactBlock on ComponentBlocksContact {
  id
  header {
    ...SectionHeader
  }
  showCompany
  contactImage: image {
    ...Media
  }
  formTopics {
    text
  }
  departments {
    ...Department
  }
  section {
    ...Section
  }
}
fragment ContentBlock on ComponentBlocksContent {
  id
  header {
    ...SectionHeader
  }
  body
  align
  collapsible
  previewParagraphs
  collapsedLabel
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
fragment MediaTextBlock on ComponentBlocksMediaText {
  id
  header {
    ...SectionHeader
  }
  body
  image {
    ...Media
  }
  imagePosition
  imageStyle
  ctas {
    ...Cta
  }
  section {
    ...Section
  }
}
fragment ReviewsBlock on ComponentBlocksReviews {
  id
  header {
    ...SectionHeader
  }
  limit
  reviewSource: source
  reviewsLayout: layout
  showSummary
  section {
    ...Section
  }
}
fragment LocationsBlock on ComponentBlocksLocations {
  id
  header {
    ...SectionHeader
  }
  locationsFilter: filter
  locationsLayout: layout
  city
  showMap
  section {
    ...Section
  }
}
fragment FeaturesBlock on ComponentBlocksFeatures {
  id
  heading: title
  variant
  items {
    title
    text
    icon
    tone
    image {
      ...Media
    }
    imageMobile {
      ...Media
    }
    link {
      ...Link
    }
  }
}
fragment FaqBlock on ComponentBlocksFaq {
  id
  header {
    ...SectionHeader
  }
  items {
    question
    answer
    category {
      documentId
      name
      slug
      icon
      order
    }
  }
  structuredData
  groupByCategory
  faqCta: cta {
    ...Link
  }
  section {
    ...Section
  }
}
fragment SectionHeader on ComponentElementsSectionHeader {
  eyebrow
  title
  lead
}
fragment Section on ComponentElementsSection {
  tone
  spacing
  width
  anchor
  background
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  ornament
}
fragment BlogCard on Blog {
  documentId
  title
  slug
  excerpt
  publishedAt
  createdAt
  category {
    documentId
    name
    color
  }
  coverImage {
    ...Media
  }
}
fragment BlogPostsBlock on ComponentBlocksBlogPosts {
  id
  badge
  title
  subtitle
  source
  limit
  category {
    documentId
  }
  posts {
    ...BlogCard
  }
  cta {
    ...Cta
  }
}
fragment Media on UploadFile {
  url
  mime
  width
  height
  alternativeText
}
fragment Link on ComponentElementsLink {
  label
  linkType
  customUrl
  newTab
  page {
    documentId
  }
  blog {
    slug
  }
}
fragment Cta on ComponentElementsCta {
  variant
  icon
  link {
    ...Link
  }
}
fragment HeroBlock on ComponentBlocksHero {
  id
  badge
  title
  subtitle
  ctas {
    ...Cta
  }
  backgroundImage {
    ...Media
  }
  backgroundImageMobile {
    ...Media
  }
  backgroundVideo {
    ...Media
  }
  overlay
  height
  reservationLayout
  reservationDefaultTerm
  highlights {
    icon
    text
  }
  heroLayout: layout
  searchSide
  focalPoint
  breadcrumbLabel
  trust {
    ...TrustBarBlock
  }
}`) as unknown as TypedDocumentString<LocalPageQuery, LocalPageQueryVariables>;
export const PageRoutesDocument = new TypedDocumentString(`
    query PageRoutes($locale: I18NLocaleCode!, $status: PublicationStatus!, $page: Int!, $pageSize: Int!) {
  pages_connection(
    locale: $locale
    status: $status
    sort: "id"
    pagination: {page: $page, pageSize: $pageSize}
  ) {
    nodes {
      documentId
      slug
      updatedAt
      parentPage {
        documentId
      }
    }
    pageInfo {
      page
      pageCount
    }
  }
}
    `) as unknown as TypedDocumentString<PageRoutesQuery, PageRoutesQueryVariables>;
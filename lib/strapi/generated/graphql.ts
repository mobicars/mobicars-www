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
  BlogComponentsDynamicZoneInput: { input: any; output: any; }
  CityComponentsDynamicZoneInput: { input: any; output: any; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  FooterExtraNavsDynamicZoneInput: { input: any; output: any; }
  FooterNavDynamicZoneInput: { input: any; output: any; }
  I18NLocaleCode: { input: string; output: string; }
  JSON: { input: any; output: any; }
  LocalPageComponentsDynamicZoneInput: { input: any; output: any; }
  NavigationItemsDynamicZoneInput: { input: any; output: any; }
  PageBlocksDynamicZoneInput: { input: any; output: any; }
  PageComponentsDynamicZoneInput: { input: any; output: any; }
  PageExtraComponentsDynamicZoneInput: { input: any; output: any; }
  ServicePointComponentsDynamicZoneInput: { input: any; output: any; }
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
  closable: InputMaybe<Scalars['Boolean']['input']>;
  enabled: InputMaybe<Scalars['Boolean']['input']>;
  endsAt: InputMaybe<Scalars['DateTime']['input']>;
  link: InputMaybe<ComponentElementsLinkInput>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  startsAt: InputMaybe<Scalars['DateTime']['input']>;
  text: InputMaybe<Scalars['String']['input']>;
  variant: InputMaybe<Enum_Announcement_Variant>;
};

export type AnnouncementRelationResponseCollection = {
  __typename?: 'AnnouncementRelationResponseCollection';
  nodes: Array<Announcement>;
};

export type Blog = {
  __typename?: 'Blog';
  components: Maybe<Array<Maybe<BlogComponentsDynamicZone>>>;
  coverImage: UploadFile;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
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

export type BlogComponentsDynamicZone = ComponentSharedBasicText | ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type BlogEntityResponseCollection = {
  __typename?: 'BlogEntityResponseCollection';
  nodes: Array<Blog>;
  pageInfo: Pagination;
};

export type BlogFiltersInput = {
  and: InputMaybe<Array<InputMaybe<BlogFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<BlogFiltersInput>;
  not: InputMaybe<BlogFiltersInput>;
  or: InputMaybe<Array<InputMaybe<BlogFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  seo: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug: InputMaybe<StringFilterInput>;
  title: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type BlogInput = {
  components: InputMaybe<Array<Scalars['BlogComponentsDynamicZoneInput']['input']>>;
  coverImage: InputMaybe<Scalars['ID']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  seo: InputMaybe<ComponentSharedSeoInput>;
  slug: InputMaybe<Scalars['String']['input']>;
  title: InputMaybe<Scalars['String']['input']>;
};

export type BlogRelationResponseCollection = {
  __typename?: 'BlogRelationResponseCollection';
  nodes: Array<Blog>;
};

export type BooleanFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  contains: InputMaybe<Scalars['Boolean']['input']>;
  containsi: InputMaybe<Scalars['Boolean']['input']>;
  endsWith: InputMaybe<Scalars['Boolean']['input']>;
  eq: InputMaybe<Scalars['Boolean']['input']>;
  eqi: InputMaybe<Scalars['Boolean']['input']>;
  gt: InputMaybe<Scalars['Boolean']['input']>;
  gte: InputMaybe<Scalars['Boolean']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lt: InputMaybe<Scalars['Boolean']['input']>;
  lte: InputMaybe<Scalars['Boolean']['input']>;
  ne: InputMaybe<Scalars['Boolean']['input']>;
  nei: InputMaybe<Scalars['Boolean']['input']>;
  not: InputMaybe<BooleanFilterInput>;
  notContains: InputMaybe<Scalars['Boolean']['input']>;
  notContainsi: InputMaybe<Scalars['Boolean']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  startsWith: InputMaybe<Scalars['Boolean']['input']>;
};

export type City = {
  __typename?: 'City';
  apiReference: Maybe<Scalars['String']['output']>;
  components: Maybe<Array<Maybe<CityComponentsDynamicZone>>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<City>>;
  localizations_connection: Maybe<CityRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  seo: Maybe<ComponentSharedSeo>;
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

export type CityComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedMap | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type CityEntityResponseCollection = {
  __typename?: 'CityEntityResponseCollection';
  nodes: Array<City>;
  pageInfo: Pagination;
};

export type CityFiltersInput = {
  and: InputMaybe<Array<InputMaybe<CityFiltersInput>>>;
  apiReference: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<CityFiltersInput>;
  not: InputMaybe<CityFiltersInput>;
  or: InputMaybe<Array<InputMaybe<CityFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  seo: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug: InputMaybe<StringFilterInput>;
  title: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type CityInput = {
  apiReference: InputMaybe<Scalars['String']['input']>;
  components: InputMaybe<Array<Scalars['CityComponentsDynamicZoneInput']['input']>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  seo: InputMaybe<ComponentSharedSeoInput>;
  slug: InputMaybe<Scalars['String']['input']>;
  title: InputMaybe<Scalars['String']['input']>;
};

export type CityRelationResponseCollection = {
  __typename?: 'CityRelationResponseCollection';
  nodes: Array<City>;
};

export type ComponentBlocksHero = {
  __typename?: 'ComponentBlocksHero';
  backgroundImage: UploadFile;
  backgroundImageMobile: Maybe<UploadFile>;
  backgroundVideo: Maybe<UploadFile>;
  badge: Maybe<Scalars['String']['output']>;
  ctas: Maybe<Array<Maybe<ComponentElementsCta>>>;
  height: Enum_Componentblockshero_Height;
  id: Scalars['ID']['output'];
  overlay: Enum_Componentblockshero_Overlay;
  reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm;
  reservationLayout: Enum_Componentblockshero_Reservationlayout;
  subtitle: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};


export type ComponentBlocksHeroCtasArgs = {
  filters: InputMaybe<ComponentElementsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentBlocksRichText = {
  __typename?: 'ComponentBlocksRichText';
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  settings: Maybe<ComponentElementsSettings>;
  title: Maybe<Scalars['String']['output']>;
};

export type ComponentElementsCta = {
  __typename?: 'ComponentElementsCta';
  icon: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  link: ComponentElementsLink;
  variant: Enum_Componentelementscta_Variant;
};

export type ComponentElementsCtaFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentElementsCtaFiltersInput>>>;
  icon: InputMaybe<StringFilterInput>;
  link: InputMaybe<ComponentElementsLinkFiltersInput>;
  not: InputMaybe<ComponentElementsCtaFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentElementsCtaFiltersInput>>>;
  variant: InputMaybe<StringFilterInput>;
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
  and: InputMaybe<Array<InputMaybe<ComponentElementsLinkFiltersInput>>>;
  blog: InputMaybe<BlogFiltersInput>;
  customUrl: InputMaybe<StringFilterInput>;
  label: InputMaybe<StringFilterInput>;
  linkType: InputMaybe<StringFilterInput>;
  localPage: InputMaybe<LocalPageFiltersInput>;
  newTab: InputMaybe<BooleanFilterInput>;
  not: InputMaybe<ComponentElementsLinkFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentElementsLinkFiltersInput>>>;
  page: InputMaybe<PageFiltersInput>;
  sale: InputMaybe<SaleFiltersInput>;
};

export type ComponentElementsLinkInput = {
  blog: InputMaybe<Scalars['ID']['input']>;
  customUrl: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  label: InputMaybe<Scalars['String']['input']>;
  linkType: InputMaybe<Enum_Componentelementslink_Linktype>;
  localPage: InputMaybe<Scalars['ID']['input']>;
  newTab: InputMaybe<Scalars['Boolean']['input']>;
  page: InputMaybe<Scalars['ID']['input']>;
  sale: InputMaybe<Scalars['ID']['input']>;
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
  id: InputMaybe<Scalars['ID']['input']>;
  keywords: InputMaybe<Scalars['String']['input']>;
  metaDescription: InputMaybe<Scalars['String']['input']>;
  metaTitle: InputMaybe<Scalars['String']['input']>;
  noFollow: InputMaybe<Scalars['Boolean']['input']>;
  noIndex: InputMaybe<Scalars['Boolean']['input']>;
  shareImage: InputMaybe<Scalars['ID']['input']>;
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
  and: InputMaybe<Array<InputMaybe<ComponentMenuGroupFiltersInput>>>;
  links: InputMaybe<ComponentElementsLinkFiltersInput>;
  not: InputMaybe<ComponentMenuGroupFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentMenuGroupFiltersInput>>>;
  title: InputMaybe<StringFilterInput>;
};

export type ComponentMenuGroupInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  links: InputMaybe<Array<InputMaybe<ComponentElementsLinkInput>>>;
  title: InputMaybe<Scalars['String']['input']>;
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
  and: InputMaybe<Array<InputMaybe<ComponentMenuItemFiltersInput>>>;
  label: InputMaybe<StringFilterInput>;
  link: InputMaybe<ComponentElementsLinkFiltersInput>;
  links: InputMaybe<ComponentElementsLinkFiltersInput>;
  not: InputMaybe<ComponentMenuItemFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentMenuItemFiltersInput>>>;
  submenu: InputMaybe<StringFilterInput>;
};

export type ComponentMenuItemInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  label: InputMaybe<Scalars['String']['input']>;
  link: InputMaybe<ComponentElementsLinkInput>;
  links: InputMaybe<Array<InputMaybe<ComponentElementsLinkInput>>>;
  submenu: InputMaybe<Enum_Componentmenuitem_Submenu>;
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
  and: InputMaybe<Array<InputMaybe<ComponentSharedCardFiltersInput>>>;
  not: InputMaybe<ComponentSharedCardFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSharedCardFiltersInput>>>;
  text: InputMaybe<JsonFilterInput>;
  title: InputMaybe<StringFilterInput>;
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
  and: InputMaybe<Array<InputMaybe<ComponentSharedCtaFiltersInput>>>;
  color: InputMaybe<StringFilterInput>;
  link: InputMaybe<ComponentSharedLinkFiltersInput>;
  not: InputMaybe<ComponentSharedCtaFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSharedCtaFiltersInput>>>;
  type: InputMaybe<StringFilterInput>;
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
  and: InputMaybe<Array<InputMaybe<ComponentSharedFaqItemFiltersInput>>>;
  answer: InputMaybe<JsonFilterInput>;
  not: InputMaybe<ComponentSharedFaqItemFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSharedFaqItemFiltersInput>>>;
  question: InputMaybe<StringFilterInput>;
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
  and: InputMaybe<Array<InputMaybe<ComponentSharedHeroFiltersInput>>>;
  badge: InputMaybe<StringFilterInput>;
  links: InputMaybe<ComponentSharedCtaFiltersInput>;
  not: InputMaybe<ComponentSharedHeroFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSharedHeroFiltersInput>>>;
  subtitle: InputMaybe<StringFilterInput>;
  title: InputMaybe<StringFilterInput>;
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
  and: InputMaybe<Array<InputMaybe<ComponentSharedLinkFiltersInput>>>;
  blog: InputMaybe<BlogFiltersInput>;
  newTab: InputMaybe<BooleanFilterInput>;
  not: InputMaybe<ComponentSharedLinkFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSharedLinkFiltersInput>>>;
  page: InputMaybe<PageFiltersInput>;
  title: InputMaybe<StringFilterInput>;
  url: InputMaybe<StringFilterInput>;
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
  blog: InputMaybe<Scalars['ID']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  newTab: InputMaybe<Scalars['Boolean']['input']>;
  page: InputMaybe<Scalars['ID']['input']>;
  title: InputMaybe<Scalars['String']['input']>;
  url: InputMaybe<Scalars['String']['input']>;
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
  and: InputMaybe<Array<InputMaybe<ComponentSharedPromoBoxFiltersInput>>>;
  link: InputMaybe<ComponentSharedCtaFiltersInput>;
  not: InputMaybe<ComponentSharedPromoBoxFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSharedPromoBoxFiltersInput>>>;
  subtitle: InputMaybe<StringFilterInput>;
  title: InputMaybe<StringFilterInput>;
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
};

export type ComponentSharedSeoFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentSharedSeoFiltersInput>>>;
  metaDescription: InputMaybe<StringFilterInput>;
  metaKewords: InputMaybe<StringFilterInput>;
  metaTitle: InputMaybe<StringFilterInput>;
  noFollow: InputMaybe<BooleanFilterInput>;
  noIndex: InputMaybe<BooleanFilterInput>;
  not: InputMaybe<ComponentSharedSeoFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSharedSeoFiltersInput>>>;
};

export type ComponentSharedSeoInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  metaDescription: InputMaybe<Scalars['String']['input']>;
  metaKewords: InputMaybe<Scalars['String']['input']>;
  metaTitle: InputMaybe<Scalars['String']['input']>;
  noFollow: InputMaybe<Scalars['Boolean']['input']>;
  noIndex: InputMaybe<Scalars['Boolean']['input']>;
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
  and: InputMaybe<Array<InputMaybe<ComponentSharedSocialUrlFiltersInput>>>;
  not: InputMaybe<ComponentSharedSocialUrlFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSharedSocialUrlFiltersInput>>>;
  url: InputMaybe<StringFilterInput>;
};

export type ComponentSharedSocialUrlInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  url: InputMaybe<Scalars['String']['input']>;
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
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  openingHours: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
};

export type ComponentSiteContactInput = {
  address: InputMaybe<Scalars['String']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  openingHours: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
};

export type ComponentSiteSocialLink = {
  __typename?: 'ComponentSiteSocialLink';
  id: Scalars['ID']['output'];
  platform: Enum_Componentsitesociallink_Platform;
  url: Scalars['String']['output'];
};

export type ComponentSiteSocialLinkFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentSiteSocialLinkFiltersInput>>>;
  not: InputMaybe<ComponentSiteSocialLinkFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSiteSocialLinkFiltersInput>>>;
  platform: InputMaybe<StringFilterInput>;
  url: InputMaybe<StringFilterInput>;
};

export type ComponentSiteSocialLinkInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  platform: InputMaybe<Enum_Componentsitesociallink_Platform>;
  url: InputMaybe<Scalars['String']['input']>;
};

export type ComponentSystemDictionary = {
  __typename?: 'ComponentSystemDictionary';
  Key: Scalars['String']['output'];
  Name: Scalars['String']['output'];
  Value: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type ComponentSystemDictionaryFiltersInput = {
  Key: InputMaybe<StringFilterInput>;
  Name: InputMaybe<StringFilterInput>;
  Value: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<ComponentSystemDictionaryFiltersInput>>>;
  not: InputMaybe<ComponentSystemDictionaryFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentSystemDictionaryFiltersInput>>>;
};

export type ComponentSystemDictionaryInput = {
  Key: InputMaybe<Scalars['String']['input']>;
  Name: InputMaybe<Scalars['String']['input']>;
  Value: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentSystemRedirects = {
  __typename?: 'ComponentSystemRedirects';
  from: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  to: Scalars['String']['output'];
};

export type DateFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  contains: InputMaybe<Scalars['Date']['input']>;
  containsi: InputMaybe<Scalars['Date']['input']>;
  endsWith: InputMaybe<Scalars['Date']['input']>;
  eq: InputMaybe<Scalars['Date']['input']>;
  eqi: InputMaybe<Scalars['Date']['input']>;
  gt: InputMaybe<Scalars['Date']['input']>;
  gte: InputMaybe<Scalars['Date']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  lt: InputMaybe<Scalars['Date']['input']>;
  lte: InputMaybe<Scalars['Date']['input']>;
  ne: InputMaybe<Scalars['Date']['input']>;
  nei: InputMaybe<Scalars['Date']['input']>;
  not: InputMaybe<DateFilterInput>;
  notContains: InputMaybe<Scalars['Date']['input']>;
  notContainsi: InputMaybe<Scalars['Date']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  startsWith: InputMaybe<Scalars['Date']['input']>;
};

export type DateTimeFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  contains: InputMaybe<Scalars['DateTime']['input']>;
  containsi: InputMaybe<Scalars['DateTime']['input']>;
  endsWith: InputMaybe<Scalars['DateTime']['input']>;
  eq: InputMaybe<Scalars['DateTime']['input']>;
  eqi: InputMaybe<Scalars['DateTime']['input']>;
  gt: InputMaybe<Scalars['DateTime']['input']>;
  gte: InputMaybe<Scalars['DateTime']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  lt: InputMaybe<Scalars['DateTime']['input']>;
  lte: InputMaybe<Scalars['DateTime']['input']>;
  ne: InputMaybe<Scalars['DateTime']['input']>;
  nei: InputMaybe<Scalars['DateTime']['input']>;
  not: InputMaybe<DateTimeFilterInput>;
  notContains: InputMaybe<Scalars['DateTime']['input']>;
  notContainsi: InputMaybe<Scalars['DateTime']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  startsWith: InputMaybe<Scalars['DateTime']['input']>;
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
  Item: InputMaybe<Array<InputMaybe<ComponentSystemDictionaryInput>>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
};

export type DictionaryRelationResponseCollection = {
  __typename?: 'DictionaryRelationResponseCollection';
  nodes: Array<Dictionary>;
};

export type Enum_Announcement_Variant =
  | 'info'
  | 'promo'
  | 'urgent';

export type Enum_Componentblockshero_Height =
  | 'compact'
  | 'default'
  | 'fullscreen';

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

export type Enum_Componentelementscta_Variant =
  | 'primary'
  | 'secondary'
  | 'success';

export type Enum_Componentelementslink_Linktype =
  | 'blog'
  | 'customUrl'
  | 'localPage'
  | 'page'
  | 'sale';

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

export type Enum_Componentmenuitem_Submenu =
  | 'blog'
  | 'fleet'
  | 'links'
  | 'locations'
  | 'none';

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

export type FileInfoInput = {
  alternativeText: InputMaybe<Scalars['String']['input']>;
  caption: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type FloatFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  contains: InputMaybe<Scalars['Float']['input']>;
  containsi: InputMaybe<Scalars['Float']['input']>;
  endsWith: InputMaybe<Scalars['Float']['input']>;
  eq: InputMaybe<Scalars['Float']['input']>;
  eqi: InputMaybe<Scalars['Float']['input']>;
  gt: InputMaybe<Scalars['Float']['input']>;
  gte: InputMaybe<Scalars['Float']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lt: InputMaybe<Scalars['Float']['input']>;
  lte: InputMaybe<Scalars['Float']['input']>;
  ne: InputMaybe<Scalars['Float']['input']>;
  nei: InputMaybe<Scalars['Float']['input']>;
  not: InputMaybe<FloatFilterInput>;
  notContains: InputMaybe<Scalars['Float']['input']>;
  notContainsi: InputMaybe<Scalars['Float']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  startsWith: InputMaybe<Scalars['Float']['input']>;
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
  extraNavs: InputMaybe<Array<Scalars['FooterExtraNavsDynamicZoneInput']['input']>>;
  info: InputMaybe<Scalars['JSON']['input']>;
  nav: InputMaybe<Array<Scalars['FooterNavDynamicZoneInput']['input']>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
};

export type FooterNavDynamicZone = ComponentSharedLinkGroup | Error;

export type FooterRelationResponseCollection = {
  __typename?: 'FooterRelationResponseCollection';
  nodes: Array<Footer>;
};

export type GenericMorph = Announcement | Blog | City | ComponentBlocksHero | ComponentBlocksRichText | ComponentElementsCta | ComponentElementsLink | ComponentElementsSeo | ComponentElementsSettings | ComponentMenuGroup | ComponentMenuItem | ComponentSharedBasicText | ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCard | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedContact | ComponentSharedCta | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedFaqItem | ComponentSharedHero | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedLink | ComponentSharedLinkGroup | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPointDetails | ComponentSharedPromoBox | ComponentSharedPromoShow | ComponentSharedReservationCalc | ComponentSharedSeo | ComponentSharedSocialMedia | ComponentSharedSocialUrl | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | ComponentSiteContact | ComponentSiteSocialLink | ComponentSystemDictionary | ComponentSystemRedirects | Dictionary | Footer | Global | I18NLocale | Infobar | Layout | LocalPage | Navigation | Page | Rating | Regulation | ReviewWorkflowsWorkflow | ReviewWorkflowsWorkflowStage | Sale | ServicePoint | Site | Social | UploadFile | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser;

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
  defaultSeo: InputMaybe<ComponentSharedSeoInput>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
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
  and: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  code: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<I18NLocaleFiltersInput>;
  or: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type IdFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contains: InputMaybe<Scalars['ID']['input']>;
  containsi: InputMaybe<Scalars['ID']['input']>;
  endsWith: InputMaybe<Scalars['ID']['input']>;
  eq: InputMaybe<Scalars['ID']['input']>;
  eqi: InputMaybe<Scalars['ID']['input']>;
  gt: InputMaybe<Scalars['ID']['input']>;
  gte: InputMaybe<Scalars['ID']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lt: InputMaybe<Scalars['ID']['input']>;
  lte: InputMaybe<Scalars['ID']['input']>;
  ne: InputMaybe<Scalars['ID']['input']>;
  nei: InputMaybe<Scalars['ID']['input']>;
  not: InputMaybe<IdFilterInput>;
  notContains: InputMaybe<Scalars['ID']['input']>;
  notContainsi: InputMaybe<Scalars['ID']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startsWith: InputMaybe<Scalars['ID']['input']>;
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
  Information: InputMaybe<Scalars['String']['input']>;
  Link: InputMaybe<ComponentSharedLinkInput>;
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  isUrgent: InputMaybe<Scalars['Boolean']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
};

export type InfobarRelationResponseCollection = {
  __typename?: 'InfobarRelationResponseCollection';
  nodes: Array<Infobar>;
};

export type IntFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  contains: InputMaybe<Scalars['Int']['input']>;
  containsi: InputMaybe<Scalars['Int']['input']>;
  endsWith: InputMaybe<Scalars['Int']['input']>;
  eq: InputMaybe<Scalars['Int']['input']>;
  eqi: InputMaybe<Scalars['Int']['input']>;
  gt: InputMaybe<Scalars['Int']['input']>;
  gte: InputMaybe<Scalars['Int']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lt: InputMaybe<Scalars['Int']['input']>;
  lte: InputMaybe<Scalars['Int']['input']>;
  ne: InputMaybe<Scalars['Int']['input']>;
  nei: InputMaybe<Scalars['Int']['input']>;
  not: InputMaybe<IntFilterInput>;
  notContains: InputMaybe<Scalars['Int']['input']>;
  notContainsi: InputMaybe<Scalars['Int']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startsWith: InputMaybe<Scalars['Int']['input']>;
};

export type JsonFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  contains: InputMaybe<Scalars['JSON']['input']>;
  containsi: InputMaybe<Scalars['JSON']['input']>;
  endsWith: InputMaybe<Scalars['JSON']['input']>;
  eq: InputMaybe<Scalars['JSON']['input']>;
  eqi: InputMaybe<Scalars['JSON']['input']>;
  gt: InputMaybe<Scalars['JSON']['input']>;
  gte: InputMaybe<Scalars['JSON']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  lt: InputMaybe<Scalars['JSON']['input']>;
  lte: InputMaybe<Scalars['JSON']['input']>;
  ne: InputMaybe<Scalars['JSON']['input']>;
  nei: InputMaybe<Scalars['JSON']['input']>;
  not: InputMaybe<JsonFilterInput>;
  notContains: InputMaybe<Scalars['JSON']['input']>;
  notContainsi: InputMaybe<Scalars['JSON']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  startsWith: InputMaybe<Scalars['JSON']['input']>;
};

export type Layout = {
  __typename?: 'Layout';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  footerGroups: Maybe<Array<Maybe<ComponentMenuGroup>>>;
  footerText: Maybe<Scalars['String']['output']>;
  header: Maybe<Array<Maybe<ComponentMenuItem>>>;
  legalLinks: Maybe<Array<Maybe<ComponentElementsLink>>>;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Layout>>;
  localizations_connection: Maybe<LayoutRelationResponseCollection>;
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

export type LayoutInput = {
  footerGroups: InputMaybe<Array<InputMaybe<ComponentMenuGroupInput>>>;
  footerText: InputMaybe<Scalars['String']['input']>;
  header: InputMaybe<Array<InputMaybe<ComponentMenuItemInput>>>;
  legalLinks: InputMaybe<Array<InputMaybe<ComponentElementsLinkInput>>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
};

export type LayoutRelationResponseCollection = {
  __typename?: 'LayoutRelationResponseCollection';
  nodes: Array<Layout>;
};

export type LocalPage = {
  __typename?: 'LocalPage';
  Title: Scalars['String']['output'];
  components: Maybe<Array<Maybe<LocalPageComponentsDynamicZone>>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<LocalPage>>;
  localizations_connection: Maybe<LocalPageRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  seo: Maybe<ComponentSharedSeo>;
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

export type LocalPageComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPromoShow | ComponentSharedReservationCalc | ComponentSharedSocialMedia | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type LocalPageEntityResponseCollection = {
  __typename?: 'LocalPageEntityResponseCollection';
  nodes: Array<LocalPage>;
  pageInfo: Pagination;
};

export type LocalPageFiltersInput = {
  Title: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<LocalPageFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<LocalPageFiltersInput>;
  not: InputMaybe<LocalPageFiltersInput>;
  or: InputMaybe<Array<InputMaybe<LocalPageFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  seo: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type LocalPageInput = {
  Title: InputMaybe<Scalars['String']['input']>;
  components: InputMaybe<Array<Scalars['LocalPageComponentsDynamicZoneInput']['input']>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  seo: InputMaybe<ComponentSharedSeoInput>;
  slug: InputMaybe<Scalars['String']['input']>;
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
  createCity: Maybe<City>;
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
  deleteCity: Maybe<DeleteMutationResponse>;
  deleteDictionary: Maybe<DeleteMutationResponse>;
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
  updateCity: Maybe<City>;
  updateDictionary: Maybe<Dictionary>;
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


export type MutationCreateCityArgs = {
  data: CityInput;
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


export type MutationDeleteCityArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteDictionaryArgs = {
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
  items: InputMaybe<Array<Scalars['NavigationItemsDynamicZoneInput']['input']>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
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

export type PageBlocksDynamicZone = ComponentBlocksHero | Error;

export type PageComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedContact | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPromoShow | ComponentSharedReservationCalc | ComponentSharedSocialMedia | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type PageEntityResponseCollection = {
  __typename?: 'PageEntityResponseCollection';
  nodes: Array<Page>;
  pageInfo: Pagination;
};

export type PageExtraComponentsDynamicZone = ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedContact | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPromoShow | ComponentSharedSocialMedia | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | Error;

export type PageFiltersInput = {
  and: InputMaybe<Array<InputMaybe<PageFiltersInput>>>;
  apiReference: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<PageFiltersInput>;
  not: InputMaybe<PageFiltersInput>;
  or: InputMaybe<Array<InputMaybe<PageFiltersInput>>>;
  parentPage: InputMaybe<PageFiltersInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  seo: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug: InputMaybe<StringFilterInput>;
  title: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type PageInput = {
  apiReference: InputMaybe<Scalars['String']['input']>;
  blocks: InputMaybe<Array<Scalars['PageBlocksDynamicZoneInput']['input']>>;
  components: InputMaybe<Array<Scalars['PageComponentsDynamicZoneInput']['input']>>;
  extraComponents: InputMaybe<Array<Scalars['PageExtraComponentsDynamicZoneInput']['input']>>;
  parentPage: InputMaybe<Scalars['ID']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  seo: InputMaybe<ComponentSharedSeoInput>;
  slug: InputMaybe<Scalars['String']['input']>;
  title: InputMaybe<Scalars['String']['input']>;
};

export type PageRelationResponseCollection = {
  __typename?: 'PageRelationResponseCollection';
  nodes: Array<Page>;
};

export type Pagination = {
  __typename?: 'Pagination';
  page: Scalars['Int']['output'];
  pageCount: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PaginationArg = {
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  pageSize: InputMaybe<Scalars['Int']['input']>;
  start: InputMaybe<Scalars['Int']['input']>;
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
  blogs: Array<Maybe<Blog>>;
  blogs_connection: Maybe<BlogEntityResponseCollection>;
  cities: Array<Maybe<City>>;
  cities_connection: Maybe<CityEntityResponseCollection>;
  city: Maybe<City>;
  dictionary: Maybe<Dictionary>;
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
  publicationFilter: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRatingsArgs = {
  filters: InputMaybe<RatingFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRatings_ConnectionArgs = {
  filters: InputMaybe<RatingFiltersInput>;
  hasPublishedVersion: InputMaybe<Scalars['Boolean']['input']>;
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
  name: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  rate: Scalars['Int']['output'];
  source: Scalars['String']['output'];
  text: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type RatingEntityResponseCollection = {
  __typename?: 'RatingEntityResponseCollection';
  nodes: Array<Rating>;
  pageInfo: Pagination;
};

export type RatingFiltersInput = {
  and: InputMaybe<Array<InputMaybe<RatingFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  date: InputMaybe<DateFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<RatingFiltersInput>;
  or: InputMaybe<Array<InputMaybe<RatingFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  rate: InputMaybe<IntFilterInput>;
  source: InputMaybe<StringFilterInput>;
  text: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type RatingInput = {
  date: InputMaybe<Scalars['Date']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  rate: InputMaybe<Scalars['Int']['input']>;
  source: InputMaybe<Scalars['String']['input']>;
  text: InputMaybe<Scalars['String']['input']>;
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
  and: InputMaybe<Array<InputMaybe<RegulationFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<RegulationFiltersInput>;
  not: InputMaybe<RegulationFiltersInput>;
  or: InputMaybe<Array<InputMaybe<RegulationFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  slug: InputMaybe<StringFilterInput>;
  title: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type RegulationInput = {
  file: InputMaybe<Scalars['ID']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  slug: InputMaybe<Scalars['String']['input']>;
  title: InputMaybe<Scalars['String']['input']>;
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
  and: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  contentTypes: InputMaybe<JsonFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  stageRequiredToPublish: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  stages: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type ReviewWorkflowsWorkflowInput = {
  contentTypes: InputMaybe<Scalars['JSON']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  stageRequiredToPublish: InputMaybe<Scalars['ID']['input']>;
  stages: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
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
  and: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  color: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  workflow: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
};

export type ReviewWorkflowsWorkflowStageInput = {
  color: InputMaybe<Scalars['String']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  workflow: InputMaybe<Scalars['ID']['input']>;
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
  Body: InputMaybe<JsonFilterInput>;
  Price: InputMaybe<FloatFilterInput>;
  Seo: InputMaybe<ComponentSharedSeoFiltersInput>;
  Title: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<SaleFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<SaleFiltersInput>;
  not: InputMaybe<SaleFiltersInput>;
  or: InputMaybe<Array<InputMaybe<SaleFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  slug: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type SaleInput = {
  Body: InputMaybe<Scalars['JSON']['input']>;
  Gallery: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  Price: InputMaybe<Scalars['Float']['input']>;
  Seo: InputMaybe<Array<InputMaybe<ComponentSharedSeoInput>>>;
  Title: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  slug: InputMaybe<Scalars['String']['input']>;
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
  and: InputMaybe<Array<InputMaybe<ServicePointFiltersInput>>>;
  apiReference: InputMaybe<IntFilterInput>;
  city: InputMaybe<CityFiltersInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<ServicePointFiltersInput>;
  not: InputMaybe<ServicePointFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ServicePointFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  seo: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug: InputMaybe<StringFilterInput>;
  title: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type ServicePointInput = {
  apiReference: InputMaybe<Scalars['Int']['input']>;
  city: InputMaybe<Scalars['ID']['input']>;
  components: InputMaybe<Array<Scalars['ServicePointComponentsDynamicZoneInput']['input']>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  seo: InputMaybe<ComponentSharedSeoInput>;
  slug: InputMaybe<Scalars['String']['input']>;
  title: InputMaybe<Scalars['String']['input']>;
};

export type ServicePointRelationResponseCollection = {
  __typename?: 'ServicePointRelationResponseCollection';
  nodes: Array<ServicePoint>;
};

export type Site = {
  __typename?: 'Site';
  contact: Maybe<ComponentSiteContact>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
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
  contact: InputMaybe<ComponentSiteContactInput>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  seo: InputMaybe<ComponentElementsSeoInput>;
  social: InputMaybe<Array<InputMaybe<ComponentSiteSocialLinkInput>>>;
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
  items: InputMaybe<Array<InputMaybe<ComponentSharedSocialUrlInput>>>;
  locale: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
};

export type StringFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contains: InputMaybe<Scalars['String']['input']>;
  containsi: InputMaybe<Scalars['String']['input']>;
  endsWith: InputMaybe<Scalars['String']['input']>;
  eq: InputMaybe<Scalars['String']['input']>;
  eqi: InputMaybe<Scalars['String']['input']>;
  gt: InputMaybe<Scalars['String']['input']>;
  gte: InputMaybe<Scalars['String']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lt: InputMaybe<Scalars['String']['input']>;
  lte: InputMaybe<Scalars['String']['input']>;
  ne: InputMaybe<Scalars['String']['input']>;
  nei: InputMaybe<Scalars['String']['input']>;
  not: InputMaybe<StringFilterInput>;
  notContains: InputMaybe<Scalars['String']['input']>;
  notContainsi: InputMaybe<Scalars['String']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startsWith: InputMaybe<Scalars['String']['input']>;
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
  alternativeText: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  caption: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  ext: InputMaybe<StringFilterInput>;
  focalPoint: InputMaybe<JsonFilterInput>;
  formats: InputMaybe<JsonFilterInput>;
  hash: InputMaybe<StringFilterInput>;
  height: InputMaybe<IntFilterInput>;
  mime: InputMaybe<StringFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<UploadFileFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  previewUrl: InputMaybe<StringFilterInput>;
  provider: InputMaybe<StringFilterInput>;
  provider_metadata: InputMaybe<JsonFilterInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  size: InputMaybe<FloatFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  url: InputMaybe<StringFilterInput>;
  width: InputMaybe<IntFilterInput>;
};

export type UploadFileRelationResponseCollection = {
  __typename?: 'UploadFileRelationResponseCollection';
  nodes: Array<UploadFile>;
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
  provider: Scalars['String']['input'];
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
  action: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  not: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  role: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
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
  and: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<UsersPermissionsRoleFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  permissions: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  type: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  users: InputMaybe<UsersPermissionsUserFiltersInput>;
};

export type UsersPermissionsRoleInput = {
  description: InputMaybe<Scalars['String']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  permissions: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  type: InputMaybe<Scalars['String']['input']>;
  users: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
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
  and: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  blocked: InputMaybe<BooleanFilterInput>;
  confirmed: InputMaybe<BooleanFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  email: InputMaybe<StringFilterInput>;
  not: InputMaybe<UsersPermissionsUserFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  provider: InputMaybe<StringFilterInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  role: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  username: InputMaybe<StringFilterInput>;
};

export type UsersPermissionsUserInput = {
  blocked: InputMaybe<Scalars['Boolean']['input']>;
  confirmationToken: InputMaybe<Scalars['String']['input']>;
  confirmed: InputMaybe<Scalars['Boolean']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  password: InputMaybe<Scalars['String']['input']>;
  provider: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  resetPasswordToken: InputMaybe<Scalars['String']['input']>;
  role: InputMaybe<Scalars['ID']['input']>;
  username: InputMaybe<Scalars['String']['input']>;
};

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection';
  nodes: Array<UsersPermissionsUser>;
};

export type ChromeQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type ChromeQuery = { __typename?: 'Query', layout: { __typename?: 'Layout', footerText: string | null, header: Array<{ __typename?: 'ComponentMenuItem', label: string, submenu: Enum_Componentmenuitem_Submenu, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null, links: Array<{ __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null> | null } | null> | null, footerGroups: Array<{ __typename?: 'ComponentMenuGroup', title: string, links: Array<{ __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null> | null } | null> | null, legalLinks: Array<{ __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null> | null } | null, announcement: { __typename?: 'Announcement', documentId: string, updatedAt: any | null, enabled: boolean, text: string, variant: Enum_Announcement_Variant, startsAt: any | null, endsAt: any | null, closable: boolean, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } | null } | null, site: { __typename?: 'Site', seo: { __typename?: 'ComponentElementsSeo', metaTitle: string | null, metaDescription: string | null, keywords: string | null, noIndex: boolean, noFollow: boolean, shareImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | null, contact: { __typename?: 'ComponentSiteContact', phone: string, email: string, address: string | null, openingHours: string | null } | null, social: Array<{ __typename?: 'ComponentSiteSocialLink', platform: Enum_Componentsitesociallink_Platform, url: string } | null> | null } | null };

export type LatestPostsQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  limit: Scalars['Int']['input'];
}>;


export type LatestPostsQuery = { __typename?: 'Query', blogs: Array<{ __typename?: 'Blog', documentId: string, title: string, slug: string, coverImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } } | null> };

export type SeoFragment = { __typename?: 'ComponentElementsSeo', metaTitle: string | null, metaDescription: string | null, keywords: string | null, noIndex: boolean, noFollow: boolean, shareImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null };

export type PageQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
}>;


export type PageQuery = { __typename?: 'Query', page: { __typename?: 'Page', documentId: string, title: string, seo: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription: string | null, noIndex: boolean | null, noFollow: boolean | null } | null, blocks: Array<{ __typename: 'ComponentBlocksHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentblockshero_Overlay, height: Enum_Componentblockshero_Height, reservationLayout: Enum_Componentblockshero_Reservationlayout, reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundVideo: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null } | { __typename: 'Error' } | null> | null } | null };

export type MediaFragment = { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null };

export type LinkFragment = { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null };

export type CtaFragment = { __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } };

export type HeroBlockFragment = { __typename?: 'ComponentBlocksHero', id: string, badge: string | null, title: string, subtitle: string | null, overlay: Enum_Componentblockshero_Overlay, height: Enum_Componentblockshero_Height, reservationLayout: Enum_Componentblockshero_Reservationlayout, reservationDefaultTerm: Enum_Componentblockshero_Reservationdefaultterm, ctas: Array<{ __typename?: 'ComponentElementsCta', variant: Enum_Componentelementscta_Variant, icon: string | null, link: { __typename?: 'ComponentElementsLink', label: string | null, linkType: Enum_Componentelementslink_Linktype, customUrl: string | null, newTab: boolean | null, page: { __typename?: 'Page', documentId: string } | null, blog: { __typename?: 'Blog', slug: string } | null } } | null> | null, backgroundImage: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null }, backgroundImageMobile: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null, backgroundVideo: { __typename?: 'UploadFile', url: string, mime: string, width: number | null, height: number | null, alternativeText: string | null } | null };

export type PageRoutesQueryVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input'];
  status: PublicationStatus;
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type PageRoutesQuery = { __typename?: 'Query', pages_connection: { __typename?: 'PageEntityResponseCollection', nodes: Array<{ __typename?: 'Page', documentId: string, slug: string, parentPage: { __typename?: 'Page', documentId: string } | null }>, pageInfo: { __typename?: 'Pagination', page: number, pageCount: number } } | null };

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
    footerText
    legalLinks {
      ...Link
    }
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
    }
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
    sort: ["publishedAt:desc", "createdAt:desc"]
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
    }
    blocks {
      __typename
      ... on ComponentBlocksHero {
        ...HeroBlock
      }
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
}`) as unknown as TypedDocumentString<PageQuery, PageQueryVariables>;
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
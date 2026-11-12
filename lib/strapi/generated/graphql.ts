import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
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
  I18NLocaleCode: { input: any; output: any; }
  JSON: { input: any; output: any; }
  LocalPageComponentsDynamicZoneInput: { input: any; output: any; }
  NavigationItemsDynamicZoneInput: { input: any; output: any; }
  PageBlocksDynamicZoneInput: { input: any; output: any; }
  PageComponentsDynamicZoneInput: { input: any; output: any; }
  PageExtraComponentsDynamicZoneInput: { input: any; output: any; }
  ServicePointComponentsDynamicZoneInput: { input: any; output: any; }
};

export type Blog = {
  __typename?: 'Blog';
  components?: Maybe<Array<Maybe<BlogComponentsDynamicZone>>>;
  coverImage: UploadFile;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Blog>>;
  localizations_connection?: Maybe<BlogRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  seo?: Maybe<ComponentSharedSeo>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type BlogLocalizationsArgs = {
  filters?: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type BlogLocalizations_ConnectionArgs = {
  filters?: InputMaybe<BlogFiltersInput>;
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
  and?: InputMaybe<Array<InputMaybe<BlogFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
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
  components?: InputMaybe<Array<Scalars['BlogComponentsDynamicZoneInput']['input']>>;
  coverImage?: InputMaybe<Scalars['ID']['input']>;
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

export type City = {
  __typename?: 'City';
  apiReference?: Maybe<Scalars['String']['output']>;
  components?: Maybe<Array<Maybe<CityComponentsDynamicZone>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<City>>;
  localizations_connection?: Maybe<CityRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  seo?: Maybe<ComponentSharedSeo>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type CityLocalizationsArgs = {
  filters?: InputMaybe<CityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CityLocalizations_ConnectionArgs = {
  filters?: InputMaybe<CityFiltersInput>;
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
  and?: InputMaybe<Array<InputMaybe<CityFiltersInput>>>;
  apiReference?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<CityFiltersInput>;
  not?: InputMaybe<CityFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<CityFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  seo?: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type CityInput = {
  apiReference?: InputMaybe<Scalars['String']['input']>;
  components?: InputMaybe<Array<Scalars['CityComponentsDynamicZoneInput']['input']>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  seo?: InputMaybe<ComponentSharedSeoInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CityRelationResponseCollection = {
  __typename?: 'CityRelationResponseCollection';
  nodes: Array<City>;
};

export type ComponentBlocksHero = {
  __typename?: 'ComponentBlocksHero';
  badge?: Maybe<Scalars['String']['output']>;
  calendarDefaultType: Enum_Componentblockshero_Calendardefaulttype;
  calendarLayout: Enum_Componentblockshero_Calendarlayout;
  ctas?: Maybe<Array<Maybe<ComponentElementsCta>>>;
  id: Scalars['ID']['output'];
  imageBackground?: Maybe<UploadFile>;
  isFullscreen: Scalars['Boolean']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  videoBackground?: Maybe<UploadFile>;
};


export type ComponentBlocksHeroCtasArgs = {
  filters?: InputMaybe<ComponentElementsCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentElementsCta = {
  __typename?: 'ComponentElementsCta';
  icon?: Maybe<Scalars['String']['output']>;
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

export type ComponentElementsLink = {
  __typename?: 'ComponentElementsLink';
  blog?: Maybe<Blog>;
  customUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  linkType: Enum_Componentelementslink_Linktype;
  localPage?: Maybe<LocalPage>;
  newTab?: Maybe<Scalars['Boolean']['output']>;
  page?: Maybe<Page>;
  sale?: Maybe<Sale>;
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

export type ComponentElementsSettings = {
  __typename?: 'ComponentElementsSettings';
  containerWidth?: Maybe<Enum_Componentelementssettings_Containerwidth>;
  id: Scalars['ID']['output'];
  sectionId?: Maybe<Scalars['String']['output']>;
  spacingBottom?: Maybe<Enum_Componentelementssettings_Spacingbottom>;
  spacingTop?: Maybe<Enum_Componentelementssettings_Spacingtop>;
  theme?: Maybe<Enum_Componentelementssettings_Theme>;
};

export type ComponentSharedBasicText = {
  __typename?: 'ComponentSharedBasicText';
  id: Scalars['ID']['output'];
  richText?: Maybe<Scalars['String']['output']>;
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
  boxes?: Maybe<Array<Maybe<ComponentSharedPromoBox>>>;
  id: Scalars['ID']['output'];
};


export type ComponentSharedBoxesBoxesArgs = {
  filters?: InputMaybe<ComponentSharedPromoBoxFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedButtons = {
  __typename?: 'ComponentSharedButtons';
  id: Scalars['ID']['output'];
  links?: Maybe<Array<Maybe<ComponentSharedCta>>>;
};


export type ComponentSharedButtonsLinksArgs = {
  filters?: InputMaybe<ComponentSharedCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedCard = {
  __typename?: 'ComponentSharedCard';
  id: Scalars['ID']['output'];
  image: UploadFile;
  text?: Maybe<Scalars['JSON']['output']>;
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
  filters?: InputMaybe<ComponentSharedCardFiltersInput>;
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
  text?: Maybe<Scalars['JSON']['output']>;
};

export type ComponentSharedCta = {
  __typename?: 'ComponentSharedCta';
  color: Enum_Componentsharedcta_Color;
  id: Scalars['ID']['output'];
  link?: Maybe<ComponentSharedLink>;
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
  items?: Maybe<Array<Maybe<ComponentSharedFaqItem>>>;
};


export type ComponentSharedFaqItemsArgs = {
  filters?: InputMaybe<ComponentSharedFaqItemFiltersInput>;
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
  badge?: Maybe<Scalars['String']['output']>;
  bgImage: UploadFile;
  bgVideo?: Maybe<UploadFile>;
  id: Scalars['ID']['output'];
  links?: Maybe<Array<Maybe<ComponentSharedCta>>>;
  subtitle?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};


export type ComponentSharedHeroLinksArgs = {
  filters?: InputMaybe<ComponentSharedCtaFiltersInput>;
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
  filters?: InputMaybe<ComponentSharedHeroFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentSharedImage = {
  __typename?: 'ComponentSharedImage';
  caption?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image: UploadFile;
};

export type ComponentSharedLink = {
  __typename?: 'ComponentSharedLink';
  blog?: Maybe<Blog>;
  id: Scalars['ID']['output'];
  newTab?: Maybe<Scalars['Boolean']['output']>;
  page?: Maybe<Page>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
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
  links?: Maybe<Array<Maybe<ComponentSharedLink>>>;
  title: Scalars['String']['output'];
};


export type ComponentSharedLinkGroupLinksArgs = {
  filters?: InputMaybe<ComponentSharedLinkFiltersInput>;
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
  isAirport?: Maybe<Scalars['Boolean']['output']>;
  isPointPage: Scalars['Boolean']['output'];
  pointId?: Maybe<Scalars['String']['output']>;
};

export type ComponentSharedPromoBox = {
  __typename?: 'ComponentSharedPromoBox';
  id: Scalars['ID']['output'];
  image: UploadFile;
  link?: Maybe<ComponentSharedCta>;
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
  isFuture?: Maybe<Scalars['Boolean']['output']>;
};

export type ComponentSharedReservationCalc = {
  __typename?: 'ComponentSharedReservationCalc';
  id: Scalars['ID']['output'];
  showCalc: Scalars['Boolean']['output'];
};

export type ComponentSharedSeo = {
  __typename?: 'ComponentSharedSeo';
  id: Scalars['ID']['output'];
  metaDescription?: Maybe<Scalars['String']['output']>;
  metaKewords?: Maybe<Scalars['String']['output']>;
  metaTitle: Scalars['String']['output'];
  noFollow?: Maybe<Scalars['Boolean']['output']>;
  noIndex?: Maybe<Scalars['Boolean']['output']>;
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
  alignment?: Maybe<Enum_Componentsharedtext_Alignment>;
  id: Scalars['ID']['output'];
  richText?: Maybe<Scalars['JSON']['output']>;
};

export type ComponentSharedTextHeading = {
  __typename?: 'ComponentSharedTextHeading';
  displayAs: Enum_Componentsharedtextheading_Displayas;
  id: Scalars['ID']['output'];
  lead?: Maybe<Scalars['JSON']['output']>;
  link?: Maybe<ComponentSharedCta>;
  title: Scalars['String']['output'];
};

export type ComponentSharedTextWithImage = {
  __typename?: 'ComponentSharedTextWithImage';
  bgColor: Enum_Componentsharedtextwithimage_Bgcolor;
  id: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  imagePosition: Enum_Componentsharedtextwithimage_Imageposition;
  links?: Maybe<Array<Maybe<ComponentSharedCta>>>;
  text?: Maybe<Scalars['JSON']['output']>;
  title: Scalars['String']['output'];
};


export type ComponentSharedTextWithImageLinksArgs = {
  filters?: InputMaybe<ComponentSharedCtaFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
  Item?: Maybe<Array<Maybe<ComponentSystemDictionary>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Dictionary>>;
  localizations_connection?: Maybe<DictionaryRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type DictionaryItemArgs = {
  filters?: InputMaybe<ComponentSystemDictionaryFiltersInput>;
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

export enum Enum_Componentblockshero_Calendardefaulttype {
  Long = 'long',
  Short = 'short'
}

export enum Enum_Componentblockshero_Calendarlayout {
  Default = 'default',
  Horizontal = 'horizontal',
  None = 'none'
}

export enum Enum_Componentelementscta_Variant {
  Ghost = 'ghost',
  Outline = 'outline',
  Primary = 'primary',
  Secondary = 'secondary'
}

export enum Enum_Componentelementslink_Linktype {
  Blog = 'blog',
  CustomUrl = 'customUrl',
  LocalPage = 'localPage',
  Page = 'page',
  Sale = 'sale'
}

export enum Enum_Componentelementssettings_Containerwidth {
  Default = 'default',
  Full = 'full',
  Narrow = 'narrow',
  Wide = 'wide'
}

export enum Enum_Componentelementssettings_Spacingbottom {
  Default = 'default',
  Large = 'large',
  None = 'none',
  Small = 'small'
}

export enum Enum_Componentelementssettings_Spacingtop {
  Default = 'default',
  Large = 'large',
  None = 'none',
  Small = 'small'
}

export enum Enum_Componentelementssettings_Theme {
  Dark = 'dark',
  Gray = 'gray',
  Light = 'light',
  Primary = 'primary'
}

export enum Enum_Componentsharedcta_Color {
  Blue = 'blue',
  Green = 'green'
}

export enum Enum_Componentsharedcta_Type {
  Bordered = 'bordered',
  Fill = 'fill'
}

export enum Enum_Componentsharedtextheading_Displayas {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6'
}

export enum Enum_Componentsharedtextwithimage_Bgcolor {
  Blue = 'blue',
  Green = 'green',
  White = 'white'
}

export enum Enum_Componentsharedtextwithimage_Imageposition {
  Left = 'left',
  Right = 'right'
}

export enum Enum_Componentsharedtext_Alignment {
  Center = 'center',
  Left = 'left',
  Right = 'right'
}

export type Error = {
  __typename?: 'Error';
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
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
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  extraNavs?: Maybe<Array<Maybe<FooterExtraNavsDynamicZone>>>;
  info?: Maybe<Scalars['JSON']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Footer>>;
  localizations_connection?: Maybe<FooterRelationResponseCollection>;
  nav?: Maybe<Array<Maybe<FooterNavDynamicZone>>>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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

export type GenericMorph = Blog | City | ComponentBlocksHero | ComponentElementsCta | ComponentElementsLink | ComponentElementsSettings | ComponentSharedBasicText | ComponentSharedBlogShow | ComponentSharedBoxes | ComponentSharedButtons | ComponentSharedCard | ComponentSharedCardGroup | ComponentSharedCarsShow | ComponentSharedContact | ComponentSharedCta | ComponentSharedDivider | ComponentSharedFaq | ComponentSharedFaqItem | ComponentSharedHero | ComponentSharedHeroPage | ComponentSharedImage | ComponentSharedLink | ComponentSharedLinkGroup | ComponentSharedMap | ComponentSharedOpinions | ComponentSharedPointDetails | ComponentSharedPromoBox | ComponentSharedPromoShow | ComponentSharedReservationCalc | ComponentSharedSeo | ComponentSharedSocialMedia | ComponentSharedSocialUrl | ComponentSharedText | ComponentSharedTextHeading | ComponentSharedTextWithImage | ComponentSystemDictionary | ComponentSystemRedirects | Dictionary | Footer | Global | I18NLocale | Infobar | LocalPage | Navigation | Page | Rating | Regulation | ReviewWorkflowsWorkflow | ReviewWorkflowsWorkflowStage | Sale | ServicePoint | Social | UploadFile | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser;

export type Global = {
  __typename?: 'Global';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  defaultSeo?: Maybe<ComponentSharedSeo>;
  documentId: Scalars['ID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Global>>;
  localizations_connection?: Maybe<GlobalRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  Link?: Maybe<ComponentSharedLink>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isUrgent?: Maybe<Scalars['Boolean']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Infobar>>;
  localizations_connection?: Maybe<InfobarRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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

export type LocalPage = {
  __typename?: 'LocalPage';
  Title: Scalars['String']['output'];
  components?: Maybe<Array<Maybe<LocalPageComponentsDynamicZone>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<LocalPage>>;
  localizations_connection?: Maybe<LocalPageRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  seo?: Maybe<ComponentSharedSeo>;
  slug?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type LocalPageLocalizationsArgs = {
  filters?: InputMaybe<LocalPageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type LocalPageLocalizations_ConnectionArgs = {
  filters?: InputMaybe<LocalPageFiltersInput>;
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
  Title?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<LocalPageFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<LocalPageFiltersInput>;
  not?: InputMaybe<LocalPageFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<LocalPageFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  seo?: InputMaybe<ComponentSharedSeoFiltersInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type LocalPageInput = {
  Title?: InputMaybe<Scalars['String']['input']>;
  components?: InputMaybe<Array<Scalars['LocalPageComponentsDynamicZoneInput']['input']>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  seo?: InputMaybe<ComponentSharedSeoInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type LocalPageRelationResponseCollection = {
  __typename?: 'LocalPageRelationResponseCollection';
  nodes: Array<LocalPage>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Change user password. Confirm with the current password. */
  changePassword?: Maybe<UsersPermissionsLoginPayload>;
  createBlog?: Maybe<Blog>;
  createCity?: Maybe<City>;
  createLocalPage?: Maybe<LocalPage>;
  createPage?: Maybe<Page>;
  createRating?: Maybe<Rating>;
  createRegulation?: Maybe<Regulation>;
  createReviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  createReviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  createSale?: Maybe<Sale>;
  createServicePoint?: Maybe<ServicePoint>;
  /** Create a new role */
  createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>;
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  deleteBlog?: Maybe<DeleteMutationResponse>;
  deleteCity?: Maybe<DeleteMutationResponse>;
  deleteDictionary?: Maybe<DeleteMutationResponse>;
  deleteFooter?: Maybe<DeleteMutationResponse>;
  deleteGlobal?: Maybe<DeleteMutationResponse>;
  deleteInfobar?: Maybe<DeleteMutationResponse>;
  deleteLocalPage?: Maybe<DeleteMutationResponse>;
  deleteNavigation?: Maybe<DeleteMutationResponse>;
  deletePage?: Maybe<DeleteMutationResponse>;
  deleteRating?: Maybe<DeleteMutationResponse>;
  deleteRegulation?: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflow?: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflowStage?: Maybe<DeleteMutationResponse>;
  deleteSale?: Maybe<DeleteMutationResponse>;
  deleteServicePoint?: Maybe<DeleteMutationResponse>;
  deleteSocial?: Maybe<DeleteMutationResponse>;
  deleteUploadFile?: Maybe<UploadFile>;
  /** Delete an existing role */
  deleteUsersPermissionsRole?: Maybe<UsersPermissionsDeleteRolePayload>;
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  /** Confirm an email users email address */
  emailConfirmation?: Maybe<UsersPermissionsLoginPayload>;
  /** Request a reset password token */
  forgotPassword?: Maybe<UsersPermissionsPasswordPayload>;
  login: UsersPermissionsLoginPayload;
  /** Register a user */
  register: UsersPermissionsLoginPayload;
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword?: Maybe<UsersPermissionsLoginPayload>;
  updateBlog?: Maybe<Blog>;
  updateCity?: Maybe<City>;
  updateDictionary?: Maybe<Dictionary>;
  updateFooter?: Maybe<Footer>;
  updateGlobal?: Maybe<Global>;
  updateInfobar?: Maybe<Infobar>;
  updateLocalPage?: Maybe<LocalPage>;
  updateNavigation?: Maybe<Navigation>;
  updatePage?: Maybe<Page>;
  updateRating?: Maybe<Rating>;
  updateRegulation?: Maybe<Regulation>;
  updateReviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  updateReviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  updateSale?: Maybe<Sale>;
  updateServicePoint?: Maybe<ServicePoint>;
  updateSocial?: Maybe<Social>;
  updateUploadFile: UploadFile;
  /** Update an existing role */
  updateUsersPermissionsRole?: Maybe<UsersPermissionsUpdateRolePayload>;
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
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateCityArgs = {
  data: CityInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateLocalPageArgs = {
  data: LocalPageInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreatePageArgs = {
  data: PageInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateRatingArgs = {
  data: RatingInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateRegulationArgs = {
  data: RegulationInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
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
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateServicePointArgs = {
  data: ServicePointInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
};


export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
};


export type MutationDeleteBlogArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteCityArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteDictionaryArgs = {
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteFooterArgs = {
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteGlobalArgs = {
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteInfobarArgs = {
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteLocalPageArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteNavigationArgs = {
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeletePageArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteRatingArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteRegulationArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteSaleArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteServicePointArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
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


export type MutationUpdateBlogArgs = {
  data: BlogInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateCityArgs = {
  data: CityInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateDictionaryArgs = {
  data: DictionaryInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateFooterArgs = {
  data: FooterInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateGlobalArgs = {
  data: GlobalInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateInfobarArgs = {
  data: InfobarInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateLocalPageArgs = {
  data: LocalPageInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateNavigationArgs = {
  data: NavigationInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdatePageArgs = {
  data: PageInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
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
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
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
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateServicePointArgs = {
  data: ServicePointInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateSocialArgs = {
  data: SocialInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateUploadFileArgs = {
  id: Scalars['ID']['input'];
  info?: InputMaybe<FileInfoInput>;
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
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  items?: Maybe<Array<Maybe<NavigationItemsDynamicZone>>>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Navigation>>;
  localizations_connection?: Maybe<NavigationRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  apiReference?: Maybe<Scalars['String']['output']>;
  blocks?: Maybe<Array<Maybe<PageBlocksDynamicZone>>>;
  components?: Maybe<Array<Maybe<PageComponentsDynamicZone>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  extraComponents?: Maybe<Array<Maybe<PageExtraComponentsDynamicZone>>>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Page>>;
  localizations_connection?: Maybe<PageRelationResponseCollection>;
  parentPage?: Maybe<Page>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  seo?: Maybe<ComponentSharedSeo>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type PageLocalizationsArgs = {
  filters?: InputMaybe<PageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type PageLocalizations_ConnectionArgs = {
  filters?: InputMaybe<PageFiltersInput>;
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
  seo?: InputMaybe<ComponentSharedSeoInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
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
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export enum PublicationFilter {
  HasPublishedVersion = 'HAS_PUBLISHED_VERSION',
  HasPublishedVersionDocument = 'HAS_PUBLISHED_VERSION_DOCUMENT',
  Modified = 'MODIFIED',
  NeverPublished = 'NEVER_PUBLISHED',
  NeverPublishedDocument = 'NEVER_PUBLISHED_DOCUMENT',
  PublishedWithoutDraft = 'PUBLISHED_WITHOUT_DRAFT',
  PublishedWithDraft = 'PUBLISHED_WITH_DRAFT',
  Unmodified = 'UNMODIFIED'
}

export enum PublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type Query = {
  __typename?: 'Query';
  blog?: Maybe<Blog>;
  blogs: Array<Maybe<Blog>>;
  blogs_connection?: Maybe<BlogEntityResponseCollection>;
  cities: Array<Maybe<City>>;
  cities_connection?: Maybe<CityEntityResponseCollection>;
  city?: Maybe<City>;
  dictionary?: Maybe<Dictionary>;
  footer?: Maybe<Footer>;
  global?: Maybe<Global>;
  i18NLocale?: Maybe<I18NLocale>;
  i18NLocales: Array<Maybe<I18NLocale>>;
  i18NLocales_connection?: Maybe<I18NLocaleEntityResponseCollection>;
  infobar?: Maybe<Infobar>;
  localPage?: Maybe<LocalPage>;
  localPages: Array<Maybe<LocalPage>>;
  localPages_connection?: Maybe<LocalPageEntityResponseCollection>;
  me?: Maybe<UsersPermissionsMe>;
  navigation?: Maybe<Navigation>;
  page?: Maybe<Page>;
  pages: Array<Maybe<Page>>;
  pages_connection?: Maybe<PageEntityResponseCollection>;
  rating?: Maybe<Rating>;
  ratings: Array<Maybe<Rating>>;
  ratings_connection?: Maybe<RatingEntityResponseCollection>;
  regulation?: Maybe<Regulation>;
  regulations: Array<Maybe<Regulation>>;
  regulations_connection?: Maybe<RegulationEntityResponseCollection>;
  reviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  reviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  reviewWorkflowsWorkflowStages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  reviewWorkflowsWorkflowStages_connection?: Maybe<ReviewWorkflowsWorkflowStageEntityResponseCollection>;
  reviewWorkflowsWorkflows: Array<Maybe<ReviewWorkflowsWorkflow>>;
  reviewWorkflowsWorkflows_connection?: Maybe<ReviewWorkflowsWorkflowEntityResponseCollection>;
  sale?: Maybe<Sale>;
  sales: Array<Maybe<Sale>>;
  sales_connection?: Maybe<SaleEntityResponseCollection>;
  servicePoint?: Maybe<ServicePoint>;
  servicePoints: Array<Maybe<ServicePoint>>;
  servicePoints_connection?: Maybe<ServicePointEntityResponseCollection>;
  social?: Maybe<Social>;
  uploadFile?: Maybe<UploadFile>;
  uploadFiles: Array<Maybe<UploadFile>>;
  uploadFiles_connection?: Maybe<UploadFileEntityResponseCollection>;
  usersPermissionsRole?: Maybe<UsersPermissionsRole>;
  usersPermissionsRoles: Array<Maybe<UsersPermissionsRole>>;
  usersPermissionsRoles_connection?: Maybe<UsersPermissionsRoleEntityResponseCollection>;
  usersPermissionsUser?: Maybe<UsersPermissionsUser>;
  usersPermissionsUsers: Array<Maybe<UsersPermissionsUser>>;
  usersPermissionsUsers_connection?: Maybe<UsersPermissionsUserEntityResponseCollection>;
};


export type QueryBlogArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryBlogsArgs = {
  filters?: InputMaybe<BlogFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryBlogs_ConnectionArgs = {
  filters?: InputMaybe<BlogFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCitiesArgs = {
  filters?: InputMaybe<CityFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCities_ConnectionArgs = {
  filters?: InputMaybe<CityFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCityArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryDictionaryArgs = {
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryFooterArgs = {
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryGlobalArgs = {
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocaleArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocalesArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocales_ConnectionArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryInfobarArgs = {
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLocalPageArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLocalPagesArgs = {
  filters?: InputMaybe<LocalPageFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLocalPages_ConnectionArgs = {
  filters?: InputMaybe<LocalPageFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryNavigationArgs = {
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPageArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPagesArgs = {
  filters?: InputMaybe<PageFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPages_ConnectionArgs = {
  filters?: InputMaybe<PageFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRatingArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRatingsArgs = {
  filters?: InputMaybe<RatingFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRatings_ConnectionArgs = {
  filters?: InputMaybe<RatingFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRegulationArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRegulationsArgs = {
  filters?: InputMaybe<RegulationFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRegulations_ConnectionArgs = {
  filters?: InputMaybe<RegulationFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStagesArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowsArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflows_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySaleArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySalesArgs = {
  filters?: InputMaybe<SaleFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySales_ConnectionArgs = {
  filters?: InputMaybe<SaleFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServicePointArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServicePointsArgs = {
  filters?: InputMaybe<ServicePointFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServicePoints_ConnectionArgs = {
  filters?: InputMaybe<ServicePointFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySocialArgs = {
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFileArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFilesArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFiles_ConnectionArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRoleArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRolesArgs = {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRoles_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUserArgs = {
  documentId: Scalars['ID']['input'];
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUsers_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationFilter?: InputMaybe<PublicationFilter>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};

export type Rating = {
  __typename?: 'Rating';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  date: Scalars['Date']['output'];
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  rate: Scalars['Int']['output'];
  source: Scalars['String']['output'];
  text: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  locale?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  rate?: InputMaybe<Scalars['Int']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type Regulation = {
  __typename?: 'Regulation';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  file: UploadFile;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Regulation>>;
  localizations_connection?: Maybe<RegulationRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type RegulationLocalizationsArgs = {
  filters?: InputMaybe<RegulationFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RegulationLocalizations_ConnectionArgs = {
  filters?: InputMaybe<RegulationFiltersInput>;
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
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  stageRequiredToPublish?: Maybe<ReviewWorkflowsWorkflowStage>;
  stages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  stages_connection?: Maybe<ReviewWorkflowsWorkflowStageRelationResponseCollection>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ReviewWorkflowsWorkflowStagesArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
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
  color?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workflow?: Maybe<ReviewWorkflowsWorkflow>;
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
  Body?: Maybe<Scalars['JSON']['output']>;
  Gallery: Array<Maybe<UploadFile>>;
  Gallery_connection: UploadFileRelationResponseCollection;
  Price: Scalars['Float']['output'];
  Seo?: Maybe<Array<Maybe<ComponentSharedSeo>>>;
  Title: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Sale>>;
  localizations_connection?: Maybe<SaleRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type SaleGalleryArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SaleGallery_ConnectionArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SaleSeoArgs = {
  filters?: InputMaybe<ComponentSharedSeoFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SaleLocalizationsArgs = {
  filters?: InputMaybe<SaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SaleLocalizations_ConnectionArgs = {
  filters?: InputMaybe<SaleFiltersInput>;
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
  city?: Maybe<City>;
  components?: Maybe<Array<Maybe<ServicePointComponentsDynamicZone>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<ServicePoint>>;
  localizations_connection?: Maybe<ServicePointRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  seo?: Maybe<ComponentSharedSeo>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ServicePointLocalizationsArgs = {
  filters?: InputMaybe<ServicePointFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ServicePointLocalizations_ConnectionArgs = {
  filters?: InputMaybe<ServicePointFiltersInput>;
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

export type Social = {
  __typename?: 'Social';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  items?: Maybe<Array<Maybe<ComponentSharedSocialUrl>>>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type SocialItemsArgs = {
  filters?: InputMaybe<ComponentSharedSocialUrlFiltersInput>;
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

export type UploadFile = {
  __typename?: 'UploadFile';
  alternativeText?: Maybe<Scalars['String']['output']>;
  caption?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  ext?: Maybe<Scalars['String']['output']>;
  focalPoint?: Maybe<Scalars['JSON']['output']>;
  formats?: Maybe<Scalars['JSON']['output']>;
  hash: Scalars['String']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  mime: Scalars['String']['output'];
  name: Scalars['String']['output'];
  previewUrl?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  provider_metadata?: Maybe<Scalars['JSON']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  related?: Maybe<Array<Maybe<GenericMorph>>>;
  size: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
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
  jwt?: Maybe<Scalars['String']['output']>;
  user: UsersPermissionsMe;
};

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe';
  blocked?: Maybe<Scalars['Boolean']['output']>;
  confirmed?: Maybe<Scalars['Boolean']['output']>;
  documentId: Scalars['ID']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  role?: Maybe<UsersPermissionsMeRole>;
  username: Scalars['String']['output'];
};

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type UsersPermissionsPasswordPayload = {
  __typename?: 'UsersPermissionsPasswordPayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission';
  action: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  role?: Maybe<UsersPermissionsRole>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Maybe<UsersPermissionsPermission>>;
  permissions_connection?: Maybe<UsersPermissionsPermissionRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  users: Array<Maybe<UsersPermissionsUser>>;
  users_connection?: Maybe<UsersPermissionsUserRelationResponseCollection>;
};


export type UsersPermissionsRolePermissionsArgs = {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRolePermissions_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRoleUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRoleUsers_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
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
  blocked?: Maybe<Scalars['Boolean']['output']>;
  confirmed?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  provider?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  role?: Maybe<UsersPermissionsRole>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse';
  data?: Maybe<UsersPermissionsUser>;
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

export type BlogTeaserFragment = { __typename?: 'BlogEntityResponseCollection', nodes: Array<{ __typename: 'Blog', locale?: string | null, title: string, slug: string, seo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null, coverImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } }> };

export type GetBlogsQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetBlogsQuery = { __typename?: 'Query', blogs_connection?: { __typename?: 'BlogEntityResponseCollection', nodes: Array<{ __typename: 'Blog', locale?: string | null, title: string, slug: string, seo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null, coverImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } }> } | null };

export type GetBlogQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetBlogQuery = { __typename?: 'Query', related?: { __typename?: 'BlogEntityResponseCollection', nodes: Array<{ __typename: 'Blog', locale?: string | null, title: string, slug: string, seo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null, coverImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } }> } | null, blogs_connection?: { __typename?: 'BlogEntityResponseCollection', nodes: Array<{ __typename?: 'Blog', locale?: string | null, title: string, slug: string, seo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null, localizations_connection?: { __typename?: 'BlogRelationResponseCollection', nodes: Array<{ __typename?: 'Blog', slug: string, locale?: string | null }> } | null, coverImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, components?: Array<{ __typename: 'ComponentSharedBasicText', markdown?: string | null } | { __typename: 'ComponentSharedBlogShow', id: string, asSlider: boolean, limit: number } | { __typename: 'ComponentSharedBoxes' } | { __typename: 'ComponentSharedButtons', id: string, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'ComponentSharedCardGroup', id: string, cards: Array<{ __typename?: 'ComponentSharedCard', title: string, text?: any | null, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | null> } | { __typename: 'ComponentSharedCarsShow', id: string, asSlider: boolean, asBox: boolean, limit: number } | { __typename: 'ComponentSharedDivider', id: string, isHuge: boolean, hasLine: boolean } | { __typename: 'ComponentSharedFaq', items?: Array<{ __typename?: 'ComponentSharedFaqItem', question: string, answer: any } | null> | null } | { __typename: 'ComponentSharedMap', fullScreen: boolean } | { __typename: 'ComponentSharedOpinions', id: string, limit: number } | { __typename: 'ComponentSharedText', richText?: any | null, alignment?: Enum_Componentsharedtext_Alignment | null } | { __typename: 'ComponentSharedTextHeading', id: string, title: string, lead?: any | null, displayAs: Enum_Componentsharedtextheading_Displayas, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | { __typename: 'ComponentSharedTextWithImage', id: string, title: string, text?: any | null, bgColor: Enum_Componentsharedtextwithimage_Bgcolor, imagePosition: Enum_Componentsharedtextwithimage_Imageposition, image?: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'Error' } | null> | null }> } | null };

export type SeoFragment = { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null };

export type ImageFragment = { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string };

export type VideoFragment = { __typename?: 'UploadFile', src: string };

export type LinkFragment = { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null };

export type CtaFragment = { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null };

export type HeroPageFieldsFragment = { __typename?: 'ComponentSharedHeroPage', id: string, isFullscreen: boolean, showCalendar: boolean, showLongTermAsDefault: boolean, hero: Array<{ __typename?: 'ComponentSharedHero', title: string, subtitle?: string | null, badge?: string | null, bgImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, bgVideo?: { __typename?: 'UploadFile', src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | null> };

export type ButtonsFieldsFragment = { __typename?: 'ComponentSharedButtons', id: string, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null };

export type OpinionsFieldsFragment = { __typename?: 'ComponentSharedOpinions', id: string, limit: number };

export type CardFieldsFragment = { __typename?: 'ComponentSharedCardGroup', id: string, cards: Array<{ __typename?: 'ComponentSharedCard', title: string, text?: any | null, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | null> };

export type BoxesFieldsFragment = { __typename?: 'ComponentSharedBoxes', id: string, asSlider: boolean, boxes?: Array<{ __typename?: 'ComponentSharedPromoBox', title: string, subtitle: string, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | null> | null };

export type TextHeadingFieldsFragment = { __typename?: 'ComponentSharedTextHeading', id: string, title: string, lead?: any | null, displayAs: Enum_Componentsharedtextheading_Displayas, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null };

export type DividerFieldsFragment = { __typename?: 'ComponentSharedDivider', id: string, isHuge: boolean, hasLine: boolean };

export type TextWithImageFieldsFragment = { __typename?: 'ComponentSharedTextWithImage', id: string, title: string, text?: any | null, bgColor: Enum_Componentsharedtextwithimage_Bgcolor, imagePosition: Enum_Componentsharedtextwithimage_Imageposition, image?: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null };

export type ImageFieldsFragment = { __typename?: 'ComponentSharedImage', id: string, caption?: string | null, imageRequred: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } };

export type CarsShowFieldsFragment = { __typename?: 'ComponentSharedCarsShow', id: string, asSlider: boolean, asBox: boolean, limit: number };

export type BlogShowFieldsFragment = { __typename?: 'ComponentSharedBlogShow', id: string, asSlider: boolean, limit: number };

export type FaqItemFieldsFragment = { __typename?: 'ComponentSharedFaqItem', question: string, answer: any };

export type TextFieldsFragment = { __typename?: 'ComponentSharedText', richText?: any | null, alignment?: Enum_Componentsharedtext_Alignment | null };

export type BasicTextFieldsFragment = { __typename?: 'ComponentSharedBasicText', markdown?: string | null };

export type PromoShowFieldsFragment = { __typename?: 'ComponentSharedPromoShow', isFuture?: boolean | null };

export type ContactFieldsFragment = { __typename?: 'ComponentSharedContact', showData: boolean, text?: any | null };

export type GetDictionaryQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type GetDictionaryQuery = { __typename?: 'Query', dictionary?: { __typename?: 'Dictionary', Item?: Array<{ __typename?: 'ComponentSystemDictionary', Name: string, Key: string, Value: string } | null> | null } | null };

export type GetDocumentQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetDocumentQuery = { __typename?: 'Query', regulations_connection?: { __typename?: 'RegulationEntityResponseCollection', nodes: Array<{ __typename: 'Regulation', title: string, slug?: string | null, file: { __typename?: 'UploadFile', url: string }, localizations_connection?: { __typename?: 'RegulationRelationResponseCollection', nodes: Array<{ __typename?: 'Regulation', slug?: string | null, locale?: string | null }> } | null }> } | null };

export type GetLayoutQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type GetLayoutQuery = { __typename?: 'Query', navigation?: { __typename?: 'Navigation', items?: Array<{ __typename: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | { __typename: 'ComponentSharedLinkGroup', groupTitle: string, links?: Array<{ __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null> | null } | { __typename: 'Error' } | null> | null } | null, social?: { __typename?: 'Social', items?: Array<{ __typename?: 'ComponentSharedSocialUrl', url: string, id: string } | null> | null } | null, points?: { __typename?: 'ServicePointEntityResponseCollection', nodes: Array<{ __typename?: 'ServicePoint', locale?: string | null, title: string, slug: string, city?: { __typename?: 'City', slug: string } | null }> } | null, cities?: { __typename?: 'CityEntityResponseCollection', nodes: Array<{ __typename?: 'City', locale?: string | null, title: string, slug: string }> } | null, footer?: { __typename?: 'Footer', info?: any | null, nav?: Array<{ __typename: 'ComponentSharedLinkGroup', groupTitle: string, links?: Array<{ __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null> | null } | { __typename: 'Error' } | null> | null, extraNavs?: Array<{ __typename: 'ComponentSharedLinkGroup', groupTitle: string, links?: Array<{ __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null> | null } | { __typename: 'Error' } | null> | null } | null, infobar?: { __typename?: 'Infobar', Information: string, isActive?: boolean | null, isUrgent?: boolean | null, updatedAt?: any | null, Link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null };

export type GetLocalPageQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLocalPageQuery = { __typename?: 'Query', localPages_connection?: { __typename?: 'LocalPageEntityResponseCollection', nodes: Array<{ __typename: 'LocalPage', Title: string, slug?: string | null, seo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null, localizations_connection?: { __typename?: 'LocalPageRelationResponseCollection', nodes: Array<{ __typename?: 'LocalPage', slug?: string | null, locale?: string | null }> } | null, components?: Array<{ __typename: 'ComponentSharedBlogShow', id: string, asSlider: boolean, limit: number } | { __typename: 'ComponentSharedBoxes', id: string, asSlider: boolean, boxes?: Array<{ __typename?: 'ComponentSharedPromoBox', title: string, subtitle: string, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | null> | null } | { __typename: 'ComponentSharedButtons', id: string, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'ComponentSharedCardGroup', id: string, cards: Array<{ __typename?: 'ComponentSharedCard', title: string, text?: any | null, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | null> } | { __typename: 'ComponentSharedCarsShow', id: string, asSlider: boolean, asBox: boolean, limit: number } | { __typename: 'ComponentSharedDivider', id: string, isHuge: boolean, hasLine: boolean } | { __typename: 'ComponentSharedFaq', items?: Array<{ __typename?: 'ComponentSharedFaqItem', question: string, answer: any } | null> | null } | { __typename: 'ComponentSharedHeroPage', id: string, isFullscreen: boolean, showCalendar: boolean, showLongTermAsDefault: boolean, hero: Array<{ __typename?: 'ComponentSharedHero', title: string, subtitle?: string | null, badge?: string | null, bgImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, bgVideo?: { __typename?: 'UploadFile', src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | null> } | { __typename: 'ComponentSharedImage', id: string, caption?: string | null, imageRequred: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | { __typename: 'ComponentSharedMap', fullScreen: boolean } | { __typename: 'ComponentSharedOpinions', id: string, limit: number } | { __typename: 'ComponentSharedPromoShow', isFuture?: boolean | null } | { __typename: 'ComponentSharedReservationCalc' } | { __typename: 'ComponentSharedSocialMedia' } | { __typename: 'ComponentSharedText', richText?: any | null, alignment?: Enum_Componentsharedtext_Alignment | null } | { __typename: 'ComponentSharedTextHeading', id: string, title: string, lead?: any | null, displayAs: Enum_Componentsharedtextheading_Displayas, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | { __typename: 'ComponentSharedTextWithImage', id: string, title: string, text?: any | null, bgColor: Enum_Componentsharedtextwithimage_Bgcolor, imagePosition: Enum_Componentsharedtextwithimage_Imageposition, image?: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'Error' } | null> | null }> } | null };

export type GetPageQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPageQuery = { __typename?: 'Query', pages_connection?: { __typename?: 'PageEntityResponseCollection', nodes: Array<{ __typename: 'Page', title: string, slug: string, apiReference?: string | null, parentPage?: { __typename?: 'Page', slug: string } | null, seo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null, localizations_connection?: { __typename?: 'PageRelationResponseCollection', nodes: Array<{ __typename?: 'Page', slug: string, locale?: string | null }> } | null, components?: Array<{ __typename: 'ComponentSharedBlogShow', id: string, asSlider: boolean, limit: number } | { __typename: 'ComponentSharedBoxes', id: string, asSlider: boolean, boxes?: Array<{ __typename?: 'ComponentSharedPromoBox', title: string, subtitle: string, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | null> | null } | { __typename: 'ComponentSharedButtons', id: string, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'ComponentSharedCardGroup', id: string, cards: Array<{ __typename?: 'ComponentSharedCard', title: string, text?: any | null, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | null> } | { __typename: 'ComponentSharedCarsShow', id: string, asSlider: boolean, asBox: boolean, limit: number } | { __typename: 'ComponentSharedContact', showData: boolean, text?: any | null } | { __typename: 'ComponentSharedDivider', id: string, isHuge: boolean, hasLine: boolean } | { __typename: 'ComponentSharedFaq', items?: Array<{ __typename?: 'ComponentSharedFaqItem', question: string, answer: any } | null> | null } | { __typename: 'ComponentSharedHeroPage', id: string, isFullscreen: boolean, showCalendar: boolean, showLongTermAsDefault: boolean, hero: Array<{ __typename?: 'ComponentSharedHero', title: string, subtitle?: string | null, badge?: string | null, bgImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, bgVideo?: { __typename?: 'UploadFile', src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | null> } | { __typename: 'ComponentSharedImage', id: string, caption?: string | null, imageRequred: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | { __typename: 'ComponentSharedMap', fullScreen: boolean } | { __typename: 'ComponentSharedOpinions', id: string, limit: number } | { __typename: 'ComponentSharedPromoShow', isFuture?: boolean | null } | { __typename: 'ComponentSharedReservationCalc' } | { __typename: 'ComponentSharedSocialMedia' } | { __typename: 'ComponentSharedText', richText?: any | null, alignment?: Enum_Componentsharedtext_Alignment | null } | { __typename: 'ComponentSharedTextHeading', id: string, title: string, lead?: any | null, displayAs: Enum_Componentsharedtextheading_Displayas, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | { __typename: 'ComponentSharedTextWithImage', id: string, title: string, text?: any | null, bgColor: Enum_Componentsharedtextwithimage_Bgcolor, imagePosition: Enum_Componentsharedtextwithimage_Imageposition, image?: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'Error' } | null> | null, extraComponents?: Array<{ __typename: 'ComponentSharedBlogShow', id: string, asSlider: boolean, limit: number } | { __typename: 'ComponentSharedBoxes', id: string, asSlider: boolean, boxes?: Array<{ __typename?: 'ComponentSharedPromoBox', title: string, subtitle: string, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | null> | null } | { __typename: 'ComponentSharedButtons', id: string, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'ComponentSharedCardGroup', id: string, cards: Array<{ __typename?: 'ComponentSharedCard', title: string, text?: any | null, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | null> } | { __typename: 'ComponentSharedCarsShow', id: string, asSlider: boolean, asBox: boolean, limit: number } | { __typename: 'ComponentSharedContact', showData: boolean, text?: any | null } | { __typename: 'ComponentSharedDivider', id: string, isHuge: boolean, hasLine: boolean } | { __typename: 'ComponentSharedFaq', items?: Array<{ __typename?: 'ComponentSharedFaqItem', question: string, answer: any } | null> | null } | { __typename: 'ComponentSharedHeroPage', id: string, isFullscreen: boolean, showCalendar: boolean, showLongTermAsDefault: boolean, hero: Array<{ __typename?: 'ComponentSharedHero', title: string, subtitle?: string | null, badge?: string | null, bgImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, bgVideo?: { __typename?: 'UploadFile', src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | null> } | { __typename: 'ComponentSharedImage', id: string, caption?: string | null, imageRequred: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | { __typename: 'ComponentSharedMap', fullScreen: boolean } | { __typename: 'ComponentSharedOpinions', id: string, limit: number } | { __typename: 'ComponentSharedPromoShow' } | { __typename: 'ComponentSharedSocialMedia' } | { __typename: 'ComponentSharedText', richText?: any | null, alignment?: Enum_Componentsharedtext_Alignment | null } | { __typename: 'ComponentSharedTextHeading', id: string, title: string, lead?: any | null, displayAs: Enum_Componentsharedtextheading_Displayas, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | { __typename: 'ComponentSharedTextWithImage', id: string, title: string, text?: any | null, bgColor: Enum_Componentsharedtextwithimage_Bgcolor, imagePosition: Enum_Componentsharedtextwithimage_Imageposition, image?: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'Error' } | null> | null }> } | null, cities_connection?: { __typename?: 'CityEntityResponseCollection', nodes: Array<{ __typename: 'City', title: string, slug: string, apiReference?: string | null, seo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null, localizations_connection?: { __typename?: 'CityRelationResponseCollection', nodes: Array<{ __typename?: 'City', slug: string, locale?: string | null }> } | null, components?: Array<{ __typename: 'ComponentSharedBlogShow', id: string, asSlider: boolean, limit: number } | { __typename: 'ComponentSharedBoxes', id: string, asSlider: boolean, boxes?: Array<{ __typename?: 'ComponentSharedPromoBox', title: string, subtitle: string, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | null> | null } | { __typename: 'ComponentSharedCardGroup', id: string, cards: Array<{ __typename?: 'ComponentSharedCard', title: string, text?: any | null, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | null> } | { __typename: 'ComponentSharedCarsShow', id: string, asSlider: boolean, asBox: boolean, limit: number } | { __typename: 'ComponentSharedDivider', id: string, isHuge: boolean, hasLine: boolean } | { __typename: 'ComponentSharedFaq', items?: Array<{ __typename?: 'ComponentSharedFaqItem', question: string, answer: any } | null> | null } | { __typename: 'ComponentSharedHeroPage', id: string, isFullscreen: boolean, showCalendar: boolean, showLongTermAsDefault: boolean, hero: Array<{ __typename?: 'ComponentSharedHero', title: string, subtitle?: string | null, badge?: string | null, bgImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, bgVideo?: { __typename?: 'UploadFile', src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | null> } | { __typename: 'ComponentSharedMap', fullScreen: boolean } | { __typename: 'ComponentSharedText', richText?: any | null, alignment?: Enum_Componentsharedtext_Alignment | null } | { __typename: 'ComponentSharedTextHeading', id: string, title: string, lead?: any | null, displayAs: Enum_Componentsharedtextheading_Displayas, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | { __typename: 'ComponentSharedTextWithImage', id: string, title: string, text?: any | null, bgColor: Enum_Componentsharedtextwithimage_Bgcolor, imagePosition: Enum_Componentsharedtextwithimage_Imageposition, image?: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'Error' } | null> | null }> } | null, servicePoints_connection?: { __typename?: 'ServicePointEntityResponseCollection', nodes: Array<{ __typename: 'ServicePoint', title: string, slug: string, apiReference: number, city?: { __typename?: 'City', title: string, slug: string } | null, seo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null, localizations_connection?: { __typename?: 'ServicePointRelationResponseCollection', nodes: Array<{ __typename?: 'ServicePoint', slug: string, locale?: string | null }> } | null, components?: Array<{ __typename: 'ComponentSharedBlogShow', id: string, asSlider: boolean, limit: number } | { __typename: 'ComponentSharedBoxes', id: string, asSlider: boolean, boxes?: Array<{ __typename?: 'ComponentSharedPromoBox', title: string, subtitle: string, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | null> | null } | { __typename: 'ComponentSharedButtons' } | { __typename: 'ComponentSharedCard' } | { __typename: 'ComponentSharedCardGroup', id: string, cards: Array<{ __typename?: 'ComponentSharedCard', title: string, text?: any | null, image: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | null> } | { __typename: 'ComponentSharedCarsShow', id: string, asSlider: boolean, asBox: boolean, limit: number } | { __typename: 'ComponentSharedDivider', id: string, isHuge: boolean, hasLine: boolean } | { __typename: 'ComponentSharedFaq', items?: Array<{ __typename?: 'ComponentSharedFaqItem', question: string, answer: any } | null> | null } | { __typename: 'ComponentSharedHeroPage', id: string, isFullscreen: boolean, showCalendar: boolean, showLongTermAsDefault: boolean, hero: Array<{ __typename?: 'ComponentSharedHero', title: string, subtitle?: string | null, badge?: string | null, bgImage: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string }, bgVideo?: { __typename?: 'UploadFile', src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | null> } | { __typename: 'ComponentSharedImage', id: string, caption?: string | null, imageRequred: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } } | { __typename: 'ComponentSharedMap', fullScreen: boolean } | { __typename: 'ComponentSharedSocialMedia' } | { __typename: 'ComponentSharedText', richText?: any | null, alignment?: Enum_Componentsharedtext_Alignment | null } | { __typename: 'ComponentSharedTextHeading', id: string, title: string, lead?: any | null, displayAs: Enum_Componentsharedtextheading_Displayas, link?: { __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null } | { __typename: 'ComponentSharedTextWithImage', id: string, title: string, text?: any | null, bgColor: Enum_Componentsharedtextwithimage_Bgcolor, imagePosition: Enum_Componentsharedtextwithimage_Imageposition, image?: { __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null, links?: Array<{ __typename?: 'ComponentSharedCta', id: string, color: Enum_Componentsharedcta_Color, type: Enum_Componentsharedcta_Type, link?: { __typename?: 'ComponentSharedLink', id: string, title?: string | null, url?: string | null, newTab?: boolean | null, page?: { __typename: 'Page', locale?: string | null, title: string, slug: string } | null, blog?: { __typename: 'Blog', locale?: string | null, title: string, slug: string } | null } | null } | null> | null } | { __typename: 'Error' } | null> | null }> } | null };

export type RatingFieldsFragment = { __typename?: 'Rating', date: any, name: string, text: string, rate: number, source: string };

export type GetRatingsQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRatingsQuery = { __typename?: 'Query', ratings_connection?: { __typename?: 'RatingEntityResponseCollection', nodes: Array<{ __typename?: 'Rating', date: any, name: string, text: string, rate: number, source: string }> } | null };

export type GetSaleQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSaleQuery = { __typename?: 'Query', sales_connection?: { __typename?: 'SaleEntityResponseCollection', nodes: Array<{ __typename?: 'Sale', locale?: string | null, Title: string, slug?: string | null, Price: number, Body?: any | null, Seo?: Array<{ __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null> | null, localizations_connection?: { __typename?: 'SaleRelationResponseCollection', nodes: Array<{ __typename?: 'Sale', slug?: string | null, locale?: string | null }> } | null, Gallery: Array<{ __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null> }> } | null };

export type SaleTeaserFragment = { __typename?: 'SaleEntityResponseCollection', nodes: Array<{ __typename: 'Sale', Title: string, Price: number, slug?: string | null, locale?: string | null, Gallery: Array<{ __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null>, Seo?: Array<{ __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null> | null }> };

export type GetSalesQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type GetSalesQuery = { __typename?: 'Query', sales_connection?: { __typename?: 'SaleEntityResponseCollection', nodes: Array<{ __typename: 'Sale', Title: string, Price: number, slug?: string | null, locale?: string | null, Gallery: Array<{ __typename?: 'UploadFile', width?: number | null, height?: number | null, alt?: string | null, src: string } | null>, Seo?: Array<{ __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null> | null }> } | null };

export type GetSeoQueryVariables = Exact<{
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type GetSeoQuery = { __typename?: 'Query', global?: { __typename?: 'Global', defaultSeo?: { __typename?: 'ComponentSharedSeo', metaTitle: string, metaDescription?: string | null, metaKewords?: string | null, noIndex?: boolean | null, noFollow?: boolean | null } | null } | null };

export type GetSitemapPagesQueryVariables = Exact<{
  status?: InputMaybe<PublicationStatus>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type GetSitemapPagesQuery = { __typename?: 'Query', pages_connection?: { __typename?: 'PageEntityResponseCollection', nodes: Array<{ __typename: 'Page', slug: string, updatedAt?: any | null, title: string, localizations_connection?: { __typename?: 'PageRelationResponseCollection', nodes: Array<{ __typename?: 'Page', slug: string, locale?: string | null }> } | null }> } | null, localPages_connection?: { __typename?: 'LocalPageEntityResponseCollection', nodes: Array<{ __typename: 'LocalPage', slug?: string | null, updatedAt?: any | null, Title: string, localizations_connection?: { __typename?: 'LocalPageRelationResponseCollection', nodes: Array<{ __typename?: 'LocalPage', slug?: string | null, locale?: string | null }> } | null }> } | null, cities_connection?: { __typename?: 'CityEntityResponseCollection', nodes: Array<{ __typename: 'City', slug: string, updatedAt?: any | null, title: string, localizations_connection?: { __typename?: 'CityRelationResponseCollection', nodes: Array<{ __typename?: 'City', slug: string, locale?: string | null }> } | null }> } | null, blogs_connection?: { __typename?: 'BlogEntityResponseCollection', nodes: Array<{ __typename: 'Blog', slug: string, updatedAt?: any | null, title: string, localizations_connection?: { __typename?: 'BlogRelationResponseCollection', nodes: Array<{ __typename?: 'Blog', slug: string, locale?: string | null }> } | null }> } | null };

export const SeoFragmentDoc = gql`
    fragment Seo on ComponentSharedSeo {
  metaTitle
  metaDescription
  metaKewords
  noIndex
  noFollow
}
    `;
export const ImageFragmentDoc = gql`
    fragment Image on UploadFile {
  alt: alternativeText
  width
  height
  src: url
}
    `;
export const BlogTeaserFragmentDoc = gql`
    fragment BlogTeaser on BlogEntityResponseCollection {
  nodes {
    __typename
    locale
    title
    slug
    seo {
      ...Seo
    }
    coverImage {
      ...Image
    }
  }
}
    ${SeoFragmentDoc}
${ImageFragmentDoc}`;
export const VideoFragmentDoc = gql`
    fragment Video on UploadFile {
  src: url
}
    `;
export const LinkFragmentDoc = gql`
    fragment Link on ComponentSharedLink {
  id
  page {
    __typename
    locale
    title
    slug
  }
  blog {
    __typename
    locale
    title
    slug
  }
  title
  url
  newTab
}
    `;
export const CtaFragmentDoc = gql`
    fragment Cta on ComponentSharedCta {
  id
  color
  type
  link {
    ...Link
  }
}
    ${LinkFragmentDoc}`;
export const HeroPageFieldsFragmentDoc = gql`
    fragment HeroPageFields on ComponentSharedHeroPage {
  id
  isFullscreen
  showCalendar
  showLongTermAsDefault
  hero {
    title
    subtitle
    badge
    bgImage {
      ...Image
    }
    bgVideo {
      ...Video
    }
    links {
      ...Cta
    }
  }
}
    ${ImageFragmentDoc}
${VideoFragmentDoc}
${CtaFragmentDoc}`;
export const ButtonsFieldsFragmentDoc = gql`
    fragment ButtonsFields on ComponentSharedButtons {
  id
  links {
    ...Cta
  }
}
    ${CtaFragmentDoc}`;
export const OpinionsFieldsFragmentDoc = gql`
    fragment OpinionsFields on ComponentSharedOpinions {
  id
  limit: items
}
    `;
export const CardFieldsFragmentDoc = gql`
    fragment CardFields on ComponentSharedCardGroup {
  id
  cards {
    title
    text
    image {
      ...Image
    }
  }
}
    ${ImageFragmentDoc}`;
export const BoxesFieldsFragmentDoc = gql`
    fragment BoxesFields on ComponentSharedBoxes {
  id
  asSlider
  boxes {
    title
    subtitle
    image {
      ...Image
    }
    link {
      ...Cta
    }
  }
}
    ${ImageFragmentDoc}
${CtaFragmentDoc}`;
export const TextHeadingFieldsFragmentDoc = gql`
    fragment TextHeadingFields on ComponentSharedTextHeading {
  id
  title
  lead
  displayAs
  link {
    ...Cta
  }
}
    ${CtaFragmentDoc}`;
export const DividerFieldsFragmentDoc = gql`
    fragment DividerFields on ComponentSharedDivider {
  id
  isHuge
  hasLine
}
    `;
export const TextWithImageFieldsFragmentDoc = gql`
    fragment TextWithImageFields on ComponentSharedTextWithImage {
  id
  title
  text
  bgColor
  image {
    ...Image
  }
  imagePosition
  links {
    ...Cta
  }
}
    ${ImageFragmentDoc}
${CtaFragmentDoc}`;
export const ImageFieldsFragmentDoc = gql`
    fragment ImageFields on ComponentSharedImage {
  id
  imageRequred: image {
    ...Image
  }
  caption
}
    ${ImageFragmentDoc}`;
export const CarsShowFieldsFragmentDoc = gql`
    fragment CarsShowFields on ComponentSharedCarsShow {
  id
  asSlider
  asBox
  limit
}
    `;
export const BlogShowFieldsFragmentDoc = gql`
    fragment BlogShowFields on ComponentSharedBlogShow {
  id
  asSlider
  limit
}
    `;
export const FaqItemFieldsFragmentDoc = gql`
    fragment FaqItemFields on ComponentSharedFaqItem {
  question
  answer
}
    `;
export const TextFieldsFragmentDoc = gql`
    fragment TextFields on ComponentSharedText {
  richText
  alignment
}
    `;
export const BasicTextFieldsFragmentDoc = gql`
    fragment BasicTextFields on ComponentSharedBasicText {
  markdown: richText
}
    `;
export const PromoShowFieldsFragmentDoc = gql`
    fragment PromoShowFields on ComponentSharedPromoShow {
  isFuture
}
    `;
export const ContactFieldsFragmentDoc = gql`
    fragment ContactFields on ComponentSharedContact {
  showData
  text
}
    `;
export const RatingFieldsFragmentDoc = gql`
    fragment ratingFields on Rating {
  date
  name
  text
  rate
  source
}
    `;
export const SaleTeaserFragmentDoc = gql`
    fragment SaleTeaser on SaleEntityResponseCollection {
  nodes {
    __typename
    Title
    Price
    Gallery(pagination: {limit: 1}) {
      ...Image
    }
    Seo(pagination: {limit: 1}) {
      ...Seo
    }
    slug
    locale
  }
}
    ${ImageFragmentDoc}
${SeoFragmentDoc}`;
export const GetBlogsDocument = gql`
    query getBlogs($status: PublicationStatus, $locale: I18NLocaleCode, $sort: [String], $limit: Int) {
  blogs_connection(
    status: $status
    locale: $locale
    sort: $sort
    pagination: {limit: $limit}
  ) {
    ...BlogTeaser
  }
}
    ${BlogTeaserFragmentDoc}`;
export const GetBlogDocument = gql`
    query getBlog($status: PublicationStatus, $locale: I18NLocaleCode, $slug: String, $sort: [String], $limit: Int) {
  related: blogs_connection(
    status: $status
    locale: $locale
    sort: $sort
    pagination: {limit: $limit}
  ) {
    ...BlogTeaser
  }
  blogs_connection(status: $status, locale: $locale, filters: {slug: {eq: $slug}}) {
    nodes {
      locale
      title
      slug
      seo {
        ...Seo
      }
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
      coverImage {
        ...Image
      }
      components {
        __typename
        ... on ComponentSharedDivider {
          ...DividerFields
        }
        ... on ComponentSharedCardGroup {
          ...CardFields
        }
        ... on ComponentSharedFaq {
          items(pagination: {limit: 30}) {
            ...FaqItemFields
          }
        }
        ... on ComponentSharedOpinions {
          ...OpinionsFields
        }
        ... on ComponentSharedButtons {
          ...ButtonsFields
        }
        ... on ComponentSharedTextHeading {
          ...TextHeadingFields
        }
        ... on ComponentSharedTextWithImage {
          ...TextWithImageFields
        }
        ... on ComponentSharedCarsShow {
          ...CarsShowFields
        }
        ... on ComponentSharedBlogShow {
          ...BlogShowFields
        }
        ... on ComponentSharedText {
          ...TextFields
        }
        ... on ComponentSharedMap {
          fullScreen
        }
        ... on ComponentSharedBasicText {
          ...BasicTextFields
        }
      }
    }
  }
}
    ${BlogTeaserFragmentDoc}
${SeoFragmentDoc}
${ImageFragmentDoc}
${DividerFieldsFragmentDoc}
${CardFieldsFragmentDoc}
${FaqItemFieldsFragmentDoc}
${OpinionsFieldsFragmentDoc}
${ButtonsFieldsFragmentDoc}
${TextHeadingFieldsFragmentDoc}
${TextWithImageFieldsFragmentDoc}
${CarsShowFieldsFragmentDoc}
${BlogShowFieldsFragmentDoc}
${TextFieldsFragmentDoc}
${BasicTextFieldsFragmentDoc}`;
export const GetDictionaryDocument = gql`
    query getDictionary($status: PublicationStatus, $locale: I18NLocaleCode) {
  dictionary(status: $status, locale: $locale) {
    Item(pagination: {limit: 999}) {
      Name
      Key
      Value
    }
  }
}
    `;
export const GetDocumentDocument = gql`
    query getDocument($status: PublicationStatus, $locale: I18NLocaleCode, $slug: String) {
  regulations_connection(
    status: $status
    locale: $locale
    filters: {slug: {eq: $slug}}
  ) {
    nodes {
      __typename
      title
      slug
      file {
        url
      }
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
    }
  }
}
    `;
export const GetLayoutDocument = gql`
    query getLayout($status: PublicationStatus, $locale: I18NLocaleCode) {
  navigation(status: $status, locale: $locale) {
    items {
      __typename
      ... on ComponentSharedLink {
        ...Link
      }
      ... on ComponentSharedLinkGroup {
        groupTitle: title
        links {
          ...Link
        }
      }
    }
  }
  social(status: $status) {
    items {
      url
      id
    }
  }
  points: servicePoints_connection(
    status: $status
    locale: $locale
    pagination: {limit: 999}
    sort: "title"
  ) {
    nodes {
      locale
      title
      slug
      city {
        slug
      }
    }
  }
  cities: cities_connection(
    status: $status
    locale: $locale
    pagination: {limit: 999}
    sort: "title"
  ) {
    nodes {
      locale
      title
      slug
    }
  }
  footer(status: $status, locale: $locale) {
    nav {
      __typename
      ... on ComponentSharedLinkGroup {
        groupTitle: title
        links {
          ...Link
        }
      }
    }
    extraNavs {
      __typename
      ... on ComponentSharedLinkGroup {
        groupTitle: title
        links(pagination: {limit: 50}) {
          ...Link
        }
      }
    }
    info
  }
  infobar(status: $status, locale: $locale) {
    Information
    isActive
    isUrgent
    updatedAt
    Link {
      ...Link
    }
  }
}
    ${LinkFragmentDoc}`;
export const GetLocalPageDocument = gql`
    query getLocalPage($status: PublicationStatus, $locale: I18NLocaleCode, $slug: String) {
  localPages_connection(
    status: $status
    locale: $locale
    filters: {slug: {eq: $slug}}
  ) {
    nodes {
      __typename
      Title
      slug
      seo {
        ...Seo
      }
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
      components {
        __typename
        ... on ComponentSharedHeroPage {
          ...HeroPageFields
        }
        ... on ComponentSharedDivider {
          ...DividerFields
        }
        ... on ComponentSharedCardGroup {
          ...CardFields
        }
        ... on ComponentSharedFaq {
          items(pagination: {limit: 30}) {
            ...FaqItemFields
          }
        }
        ... on ComponentSharedOpinions {
          ...OpinionsFields
        }
        ... on ComponentSharedButtons {
          ...ButtonsFields
        }
        ... on ComponentSharedTextHeading {
          ...TextHeadingFields
        }
        ... on ComponentSharedTextWithImage {
          ...TextWithImageFields
        }
        ... on ComponentSharedImage {
          ...ImageFields
        }
        ... on ComponentSharedCarsShow {
          ...CarsShowFields
        }
        ... on ComponentSharedBlogShow {
          ...BlogShowFields
        }
        ... on ComponentSharedText {
          ...TextFields
        }
        ... on ComponentSharedMap {
          fullScreen
        }
        ... on ComponentSharedBoxes {
          ...BoxesFields
        }
        ... on ComponentSharedPromoShow {
          ...PromoShowFields
        }
      }
    }
  }
}
    ${SeoFragmentDoc}
${HeroPageFieldsFragmentDoc}
${DividerFieldsFragmentDoc}
${CardFieldsFragmentDoc}
${FaqItemFieldsFragmentDoc}
${OpinionsFieldsFragmentDoc}
${ButtonsFieldsFragmentDoc}
${TextHeadingFieldsFragmentDoc}
${TextWithImageFieldsFragmentDoc}
${ImageFieldsFragmentDoc}
${CarsShowFieldsFragmentDoc}
${BlogShowFieldsFragmentDoc}
${TextFieldsFragmentDoc}
${BoxesFieldsFragmentDoc}
${PromoShowFieldsFragmentDoc}`;
export const GetPageDocument = gql`
    query getPage($status: PublicationStatus, $locale: I18NLocaleCode, $slug: String) {
  pages_connection(status: $status, locale: $locale, filters: {slug: {eq: $slug}}) {
    nodes {
      __typename
      title
      slug
      parentPage {
        slug
      }
      seo {
        ...Seo
      }
      apiReference
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
      components {
        __typename
        ... on ComponentSharedContact {
          ...ContactFields
        }
        ... on ComponentSharedHeroPage {
          ...HeroPageFields
        }
        ... on ComponentSharedDivider {
          ...DividerFields
        }
        ... on ComponentSharedCardGroup {
          ...CardFields
        }
        ... on ComponentSharedFaq {
          items(pagination: {limit: 30}) {
            ...FaqItemFields
          }
        }
        ... on ComponentSharedOpinions {
          ...OpinionsFields
        }
        ... on ComponentSharedButtons {
          ...ButtonsFields
        }
        ... on ComponentSharedTextHeading {
          ...TextHeadingFields
        }
        ... on ComponentSharedTextWithImage {
          ...TextWithImageFields
        }
        ... on ComponentSharedImage {
          ...ImageFields
        }
        ... on ComponentSharedCarsShow {
          ...CarsShowFields
        }
        ... on ComponentSharedBlogShow {
          ...BlogShowFields
        }
        ... on ComponentSharedText {
          ...TextFields
        }
        ... on ComponentSharedMap {
          fullScreen
        }
        ... on ComponentSharedBoxes {
          ...BoxesFields
        }
        ... on ComponentSharedPromoShow {
          ...PromoShowFields
        }
      }
      extraComponents {
        __typename
        ... on ComponentSharedContact {
          ...ContactFields
        }
        ... on ComponentSharedHeroPage {
          ...HeroPageFields
        }
        ... on ComponentSharedDivider {
          ...DividerFields
        }
        ... on ComponentSharedCardGroup {
          ...CardFields
        }
        ... on ComponentSharedFaq {
          items(pagination: {limit: 30}) {
            ...FaqItemFields
          }
        }
        ... on ComponentSharedOpinions {
          ...OpinionsFields
        }
        ... on ComponentSharedButtons {
          ...ButtonsFields
        }
        ... on ComponentSharedTextHeading {
          ...TextHeadingFields
        }
        ... on ComponentSharedTextWithImage {
          ...TextWithImageFields
        }
        ... on ComponentSharedImage {
          ...ImageFields
        }
        ... on ComponentSharedCarsShow {
          ...CarsShowFields
        }
        ... on ComponentSharedBlogShow {
          ...BlogShowFields
        }
        ... on ComponentSharedText {
          ...TextFields
        }
        ... on ComponentSharedMap {
          fullScreen
        }
        ... on ComponentSharedBoxes {
          ...BoxesFields
        }
      }
    }
  }
  cities_connection(
    status: $status
    locale: $locale
    filters: {slug: {eq: $slug}}
  ) {
    nodes {
      __typename
      title
      slug
      apiReference
      seo {
        ...Seo
      }
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
      components {
        __typename
        ... on ComponentSharedHeroPage {
          ...HeroPageFields
        }
        ... on ComponentSharedDivider {
          ...DividerFields
        }
        ... on ComponentSharedCardGroup {
          ...CardFields
        }
        ... on ComponentSharedFaq {
          items(pagination: {limit: 30}) {
            ...FaqItemFields
          }
        }
        ... on ComponentSharedTextHeading {
          ...TextHeadingFields
        }
        ... on ComponentSharedTextWithImage {
          ...TextWithImageFields
        }
        ... on ComponentSharedCarsShow {
          ...CarsShowFields
        }
        ... on ComponentSharedBlogShow {
          ...BlogShowFields
        }
        ... on ComponentSharedText {
          ...TextFields
        }
        ... on ComponentSharedMap {
          fullScreen
        }
        ... on ComponentSharedBoxes {
          ...BoxesFields
        }
      }
    }
  }
  servicePoints_connection(
    status: $status
    locale: $locale
    filters: {slug: {eq: $slug}}
  ) {
    nodes {
      __typename
      title
      slug
      apiReference
      city {
        title
        slug
      }
      seo {
        ...Seo
      }
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
      components {
        __typename
        ... on ComponentSharedHeroPage {
          ...HeroPageFields
        }
        ... on ComponentSharedDivider {
          ...DividerFields
        }
        ... on ComponentSharedCardGroup {
          ...CardFields
        }
        ... on ComponentSharedFaq {
          items(pagination: {limit: 30}) {
            ...FaqItemFields
          }
        }
        ... on ComponentSharedTextHeading {
          ...TextHeadingFields
        }
        ... on ComponentSharedTextWithImage {
          ...TextWithImageFields
        }
        ... on ComponentSharedImage {
          ...ImageFields
        }
        ... on ComponentSharedCarsShow {
          ...CarsShowFields
        }
        ... on ComponentSharedBlogShow {
          ...BlogShowFields
        }
        ... on ComponentSharedText {
          ...TextFields
        }
        ... on ComponentSharedMap {
          fullScreen
        }
        ... on ComponentSharedBoxes {
          ...BoxesFields
        }
      }
    }
  }
}
    ${SeoFragmentDoc}
${ContactFieldsFragmentDoc}
${HeroPageFieldsFragmentDoc}
${DividerFieldsFragmentDoc}
${CardFieldsFragmentDoc}
${FaqItemFieldsFragmentDoc}
${OpinionsFieldsFragmentDoc}
${ButtonsFieldsFragmentDoc}
${TextHeadingFieldsFragmentDoc}
${TextWithImageFieldsFragmentDoc}
${ImageFieldsFragmentDoc}
${CarsShowFieldsFragmentDoc}
${BlogShowFieldsFragmentDoc}
${TextFieldsFragmentDoc}
${BoxesFieldsFragmentDoc}
${PromoShowFieldsFragmentDoc}`;
export const GetRatingsDocument = gql`
    query getRatings($status: PublicationStatus, $sort: [String], $limit: Int) {
  ratings_connection(status: $status, sort: $sort, pagination: {limit: $limit}) {
    nodes {
      ...ratingFields
    }
  }
}
    ${RatingFieldsFragmentDoc}`;
export const GetSaleDocument = gql`
    query getSale($status: PublicationStatus, $locale: I18NLocaleCode, $slug: String) {
  sales_connection(status: $status, locale: $locale, filters: {slug: {eq: $slug}}) {
    nodes {
      locale
      Title
      slug
      Seo(pagination: {limit: 1}) {
        ...Seo
      }
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
      Price
      Gallery(pagination: {limit: 20}) {
        ...Image
      }
      Body
    }
  }
}
    ${SeoFragmentDoc}
${ImageFragmentDoc}`;
export const GetSalesDocument = gql`
    query getSales($status: PublicationStatus, $locale: I18NLocaleCode, $sort: [String]) {
  sales_connection(status: $status, locale: $locale, sort: $sort) {
    ...SaleTeaser
  }
}
    ${SaleTeaserFragmentDoc}`;
export const GetSeoDocument = gql`
    query getSeo($locale: I18NLocaleCode) {
  global(locale: $locale) {
    defaultSeo {
      ...Seo
    }
  }
}
    ${SeoFragmentDoc}`;
export const GetSitemapPagesDocument = gql`
    query getSitemapPages($status: PublicationStatus, $locale: I18NLocaleCode) {
  pages_connection(status: $status, locale: $locale, pagination: {pageSize: 100}) {
    nodes {
      __typename
      slug
      updatedAt
      title
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
    }
  }
  localPages_connection(
    status: $status
    locale: $locale
    pagination: {pageSize: 100}
  ) {
    nodes {
      __typename
      slug
      updatedAt
      Title
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
    }
  }
  cities_connection(status: $status, locale: $locale, pagination: {pageSize: 100}) {
    nodes {
      __typename
      slug
      updatedAt
      title
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
    }
  }
  blogs_connection(status: $status, locale: $locale, pagination: {pageSize: 100}) {
    nodes {
      __typename
      slug
      updatedAt
      title
      localizations_connection {
        nodes {
          slug
          locale
        }
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getBlogs(variables?: GetBlogsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetBlogsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBlogsQuery>({ document: GetBlogsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getBlogs', 'query', variables);
    },
    getBlog(variables?: GetBlogQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetBlogQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBlogQuery>({ document: GetBlogDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getBlog', 'query', variables);
    },
    getDictionary(variables?: GetDictionaryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetDictionaryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDictionaryQuery>({ document: GetDictionaryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDictionary', 'query', variables);
    },
    getDocument(variables?: GetDocumentQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetDocumentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDocumentQuery>({ document: GetDocumentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDocument', 'query', variables);
    },
    getLayout(variables?: GetLayoutQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLayoutQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLayoutQuery>({ document: GetLayoutDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLayout', 'query', variables);
    },
    getLocalPage(variables?: GetLocalPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLocalPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLocalPageQuery>({ document: GetLocalPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLocalPage', 'query', variables);
    },
    getPage(variables?: GetPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPageQuery>({ document: GetPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getPage', 'query', variables);
    },
    getRatings(variables?: GetRatingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRatingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRatingsQuery>({ document: GetRatingsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRatings', 'query', variables);
    },
    getSale(variables?: GetSaleQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSaleQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSaleQuery>({ document: GetSaleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSale', 'query', variables);
    },
    getSales(variables?: GetSalesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSalesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSalesQuery>({ document: GetSalesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSales', 'query', variables);
    },
    getSeo(variables?: GetSeoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSeoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSeoQuery>({ document: GetSeoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSeo', 'query', variables);
    },
    getSitemapPages(variables?: GetSitemapPagesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSitemapPagesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSitemapPagesQuery>({ document: GetSitemapPagesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSitemapPages', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
interface LocalBusinessData {
  name: string
  description?: string
  image?: string
  telephone?: string
  priceRange?: string
  address: {
    streetAddress?: string
    addressLocality: string
    addressRegion?: string
    postalCode?: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  url?: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  openingHours?: string[]
}

interface FAQData {
  question: string
  answer: string
}

interface BreadcrumbData {
  name: string
  item: string
}

export function LocalBusinessJsonLd({ data }: { data: LocalBusinessData }) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    ...(data.description && { description: data.description }),
    ...(data.image && { image: data.image }),
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.priceRange && { priceRange: data.priceRange }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress || '',
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion || '',
      postalCode: data.address.postalCode || '',
      addressCountry: data.address.addressCountry,
    },
    ...(data.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
      },
    }),
    ...(data.url && { url: data.url }),
    ...(data.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount,
      },
    }),
    ...(data.openingHours && data.openingHours.length > 0 && {
      openingHoursSpecification: data.openingHours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        opens: h.split('-')[0]?.trim(),
        closes: h.split('-')[1]?.trim(),
      })),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbData[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.item,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQJsonLd({ items }: { items: FAQData[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebsiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LOCObiz',
    url: 'https://locobiz.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://locobiz.in/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

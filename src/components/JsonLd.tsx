import Script from 'next/script'

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

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <Script
      id={`jsonld-${(data['@type'] as string) || 'schema'}`}
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify(data)}
    </Script>
  )
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
      openingHoursSpecification: data.openingHours.map((h) => {
        const timeMatch = h.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
        return {
          '@type': 'OpeningHoursSpecification',
          opens: timeMatch ? timeMatch[1] : '09:00',
          closes: timeMatch ? timeMatch[2] : '18:00',
        }
      }),
    }),
  }

  return <JsonLd data={schema} />
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

  return <JsonLd data={schema} />
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

  return <JsonLd data={schema} />
}

export function WebsiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ADZBE',
    url: 'https://adzbe.cloud',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://adzbe.cloud/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return <JsonLd data={schema} />
}

interface HeroProps {
  brandCount: number;
}

export default function Hero({ brandCount }: HeroProps) {
  return (
    <div className="hero">
      <h1 className="hero-title">
        Svenska märken och tillverkare
      </h1>
      <p className="hero-description">
        Databasen innehåller just nu {brandCount} märken och tillverkare. Svart på vitt med fokus på enkelhet.
      </p>
    </div>
  );
}

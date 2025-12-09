interface HeroProps {
  brandCount: number;
}

export default function Hero({ brandCount }: HeroProps) {
  return (
    <div className="hero">
      <h1 className="hero-title">
        Svenska märken
      </h1>
      <p className="hero-description">
        Databasen med svenska märken har just nu {brandCount} märken och tillverkare. Svart på vitt med fokus på enkelhet.
      </p>
    </div>
  );
}

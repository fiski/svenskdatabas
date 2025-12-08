interface HeroProps {
  brandCount: number;
}

export default function Hero({ brandCount }: HeroProps) {
  return (
    <div className="hero">
      <h1 className="hero-title">
        Svensk databas
      </h1>
      <p className="hero-description">
        Den svenska databasen med {brandCount} märken och tillverkare. Svart på vitt med fokus på enkelhet.
      </p>
    </div>
  );
}

import Button from "../Button/Button";
import { HERO_CONTENT } from "../../constants/content/hero";

function Hero() {
  const { title, subtitle, primaryButton, secondaryButton } = HERO_CONTENT;

  return (
    <section className="min-h-[70vh]">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center lg:px-8">
        <h1 className="text-5xl font-bold">{title}</h1>

        <p className="mt-4 max-w-2xl text-gray-600">{subtitle}</p>

        <div className="mt-8 flex gap-4">
          <Button variant="primary">{primaryButton}</Button>

          <Button variant="outline">{secondaryButton}</Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;

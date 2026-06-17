import Button from "../Button/Button";
import { HERO_CONTENT } from "../../constants/content/hero";

function Hero() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold">{HERO_CONTENT.title}</h1>

      <p className="mt-4 max-w-2xl text-gray-600">{HERO_CONTENT.subtitle}</p>

      <div className="mt-8 flex gap-4">
        <Button>{HERO_CONTENT.primaryButton}</Button>
        <Button>{HERO_CONTENT.secondaryButton}</Button>
      </div>
    </section>
  );
}

export default Hero;

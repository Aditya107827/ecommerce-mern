import { Link } from "react-router-dom";
import { categories } from "../../constants/categories";

function CategorySection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Shop by category
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Find something you'll love
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group rounded-2xl border border-gray-200 p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-6 flex h-40 items-center justify-center rounded-xl bg-gray-100">
                <span className="text-sm text-gray-400">
                  Category Image
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                {category.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {category.description}
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-gray-900">
                Explore →
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CategorySection;
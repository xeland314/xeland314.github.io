import CodeBlock from "@/app/components/codeBlock";

export default function URLShortenerPage() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">URL Shortener</h1>
      <p className="mb-4">
        A simple and efficient URL shortening service built with Django and
        Django REST Framework. This service allows users to shorten long URLs,
        track the number of times they are accessed, and manage their URLs
        through a RESTful API.
      </p>

      <section className="mb-6">
        <h2 className="text-3xl font-semibold mb-4">Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Shorten long URLs</li>
          <li>Retrieve original URLs from shortened URLs</li>
          <li>Track the number of times a shortened URL has been accessed</li>
          <li>Create, retrieve, update, and delete shortened URLs</li>
          <li>Use Redis as cache for improved performance</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-3xl font-semibold mb-4">Installation</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Clone the repository:</strong>
            <CodeBlock code="git clone https://github.com/yourusername/urlshortener.git" />
            <CodeBlock code="cd urlshortener" />
          </li>
          <li>
            <strong>Create a virtual environment:</strong>
            <CodeBlock code="python -m venv myenv" />
            <CodeBlock code="source myenv/bin/activate  # On Windows use `myenv\Scripts\activate`" />
          </li>
          <li>
            <strong>Install dependencies:</strong>
            <CodeBlock code="pip install -r requirements.txt" />
          </li>
          <li>
            <strong>Configure environment variables:</strong>
            <CodeBlock code={`DATABASE_URL=postgres://user:password@host:port/dbname\nDJANGO_SECRET_KEY=your_secret_key\nREDIS_URL=redis://your_redis_host:your_redis_port/1`} />
          </li>
          <li>
            <strong>Apply migrations:</strong>
            <CodeBlock code="python manage.py makemigrations && python manage.py migrate" />
          </li>
          <li>
            <strong>Create a superuser:</strong>
            <CodeBlock code="python manage.py createsuperuser" />
          </li>
          <li>
            <strong>Run the development server:</strong>
            <CodeBlock code="python manage.py runserver" />
          </li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-3xl font-semibold mb-4">Database Configuration</h2>
        <p className="mb-4">
          You can configure your project to use different databases by setting
          the <code>DATABASE_URL</code> environment variable in your{" "}
          <code>.env</code> file.
        </p>
        <h3 className="text-2xl font-bold">PostgreSQL</h3>
        <CodeBlock code="DATABASE_URL=postgres://user:password@host:port/dbname" />
        <h3 className="text-2xl font-bold">SQLite</h3>
        <CodeBlock code="DATABASE_URL=sqlite:///db.sqlite3" />
        <p>But by default Django uses SQLite...</p>
      </section>

      <section className="mb-6">
        <h2 className="text-3xl font-semibold mb-4">Cache Configuration</h2>
        <p>
          Redis is used as the cache for this project. Make sure to set the{" "}
          <code>REDIS_URL</code> environment variable in your <code>.env</code>{" "}
          file:
        </p>
        <CodeBlock code="REDIS_URL=redis://your_redis_host:your_redis_port/1" />
      </section>

      <section className="mb-6">
        <h2 className="text-3xl font-semibold mb-4">Usage</h2>
        <h3 className="text-2xl font-bold">Endpoints</h3>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>Create Short URL:</strong>
            <CodeBlock code={`POST /shorten/\nContent-Type: application/json\n{ "long_url": "https://www.example.com/some/long/url" }`} />
          </li>
          <li>
            <strong>Retrieve Original URL:</strong>
            <CodeBlock code="GET /shorten/<short_url>/" />
          </li>
          <li>
            <strong>Update Short URL:</strong>
            <CodeBlock code={`PUT /shorten/<short_url>/\nContent-Type: application/json\n{ "long_url": "https://www.example.com/some/updated/url" }`} />
          </li>
          <li>
            <strong>Delete Short URL:</strong>
            <CodeBlock code="DELETE /shorten/<short_url>/" />
          </li>
          <li>
            <strong>Redirect to Original URL:</strong>
            <CodeBlock code="GET /<short_url>/" />
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-3xl font-semibold mb-4">Contributing</h2>
        <p>
          Contributions are welcome! Please feel free to submit a Pull Request.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-3xl font-semibold mb-4">License</h2>
        <p>
          This project is licensed under the MIT License. See the{" "}
          <a href="/LICENSE" className="text-blue-600 hover:underline">
            LICENSE
          </a>{" "}
          file for details.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-3xl font-semibold mb-4">Acknowledgements</h2>
        <p>
          This project was inspired and guided by the{" "}
          <a
            href="https://roadmap.sh/projects/url-shortening-service"
            className="text-blue-600 hover:underline"
          >
            URL Shortening Service Project
          </a>{" "}
          from{" "}
          <a
            href="https://roadmap.sh"
            className="text-blue-600 hover:underline"
          >
            roadmap.sh
          </a>
          . Their comprehensive guide provided valuable insights and structure
          for developing this URL shortening service.
        </p>
      </section>
    </div>
  );
}

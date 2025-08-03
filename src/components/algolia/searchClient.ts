import { algoliasearch } from "algoliasearch";

const searchClient = algoliasearch(
  import.meta.env.PUBLIC_ALGOLIA_APP_ID || "",
  import.meta.env.PUBLIC_ALGOLIA_API_KEY || ""
);

export default searchClient;

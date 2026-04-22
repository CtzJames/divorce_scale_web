const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgSite = repoName.endsWith(".github.io");
const shouldUseProjectBasePath =
  isGithubActions && repoName && !isUserOrOrgSite;
const projectBasePath = shouldUseProjectBasePath ? `/${repoName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_BASE_PATH: projectBasePath,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  ...(projectBasePath
    ? {
        basePath: projectBasePath,
        assetPrefix: projectBasePath,
      }
    : {}),
};

export default nextConfig;

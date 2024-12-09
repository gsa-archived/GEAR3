SELECT
	id			              AS website_id,
  domain,
  office,
  sub_office,
  contact_email,
  site_owner_email,
  production_status,
  type_of_site,
  digital_brand_category,
  redirects_to,
  cms_platform,
  required_by_law_or_policy,
  has_dap,
  mobile_friendly,
  has_search,
  repository_url,
  hosting_platform,
  https,
  customer_centricity, 
  mobile_performance, 
  google_analytics, 
  accessibility, 
  uswds, 
  required_links,
  target_decommission_date,
  sitemap_url
FROM obj_websites AS websites
<?php
/**
 * Plugin Name:       HoDigital Claude Connector
 * Description:       Exposes this site as an MCP server so Claude can manage content (pages, posts, media, SEO meta) without logging in to wp-admin. Add the URL from Settings → Claude Connector as a custom connector in Claude.
 * Version:           1.0.0
 * Requires at least: 5.6
 * Requires PHP:      7.4
 * Author:            HoDigital
 * License:           GPL-2.0-or-later
 * Text Domain:       hodigital-claude-connector
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'HDCC_VERSION', '1.0.0' );
define( 'HDCC_NAMESPACE', 'hodigital-claude/v1' );
define( 'HDCC_OPT_KEY', 'hdcc_secret_key' );
define( 'HDCC_OPT_USER', 'hdcc_user_id' );

/* -------------------------------------------------------------------------
 * Activation: generate the secret key and remember which admin Claude acts as.
 * ---------------------------------------------------------------------- */

register_activation_hook( __FILE__, 'hdcc_activate' );

function hdcc_activate() {
	if ( ! get_option( HDCC_OPT_KEY ) ) {
		update_option( HDCC_OPT_KEY, hdcc_new_key(), false );
	}
	if ( ! get_option( HDCC_OPT_USER ) ) {
		$user_id = get_current_user_id();
		if ( ! $user_id || ! user_can( $user_id, 'manage_options' ) ) {
			$admins  = get_users( array( 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ) );
			$user_id = $admins ? (int) $admins[0] : 0;
		}
		update_option( HDCC_OPT_USER, (int) $user_id, false );
	}
}

function hdcc_new_key() {
	return wp_generate_password( 48, false, false );
}

function hdcc_endpoint_urls() {
	$key = get_option( HDCC_OPT_KEY );
	return array(
		'pretty' => rest_url( HDCC_NAMESPACE . '/mcp/' . $key ),
		'plain'  => add_query_arg( 'rest_route', '/' . HDCC_NAMESPACE . '/mcp/' . $key, home_url( '/' ) ),
	);
}

/* -------------------------------------------------------------------------
 * Settings page (Settings → Claude Connector)
 * ---------------------------------------------------------------------- */

add_action( 'admin_menu', function () {
	add_options_page( 'Claude Connector', 'Claude Connector', 'manage_options', 'hdcc', 'hdcc_render_settings' );
} );

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=hdcc' ) ) . '">Connector URL</a>' );
	return $links;
} );

function hdcc_render_settings() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	if ( isset( $_POST['hdcc_action'] ) && check_admin_referer( 'hdcc_settings' ) ) {
		if ( 'regenerate' === $_POST['hdcc_action'] ) {
			update_option( HDCC_OPT_KEY, hdcc_new_key(), false );
			echo '<div class="notice notice-warning"><p>A new key was generated. The old connector URL no longer works — update it in Claude.</p></div>';
		} elseif ( 'set_user' === $_POST['hdcc_action'] && isset( $_POST['hdcc_user'] ) ) {
			$uid = (int) $_POST['hdcc_user'];
			if ( user_can( $uid, 'manage_options' ) ) {
				update_option( HDCC_OPT_USER, $uid, false );
				echo '<div class="notice notice-success"><p>Saved.</p></div>';
			}
		}
	}

	if ( ! get_option( HDCC_OPT_KEY ) ) {
		hdcc_activate();
	}

	$urls    = hdcc_endpoint_urls();
	$user_id = (int) get_option( HDCC_OPT_USER );
	$admins  = get_users( array( 'role' => 'administrator' ) );
	?>
	<div class="wrap" dir="auto">
		<h1>Claude Connector</h1>
		<p>Add this URL in Claude: <strong>Settings → Connectors → Add custom connector</strong>. After that you can manage this site from Claude on any device — no wp-admin login.</p>

		<h2>Connector URL</h2>
		<p><input type="text" readonly class="large-text code" value="<?php echo esc_attr( $urls['pretty'] ); ?>" onclick="this.select()"></p>
		<p class="description">If that URL doesn't work (plain permalinks / REST blocked by a security plugin), try:</p>
		<p><input type="text" readonly class="large-text code" value="<?php echo esc_attr( $urls['plain'] ); ?>" onclick="this.select()"></p>
		<p><strong>Treat this URL like a password</strong> — anyone who has it can edit the site.</p>

		<form method="post" style="margin-top:1.5em">
			<?php wp_nonce_field( 'hdcc_settings' ); ?>
			<input type="hidden" name="hdcc_action" value="set_user">
			<label for="hdcc_user"><strong>Claude acts as:</strong></label>
			<select name="hdcc_user" id="hdcc_user">
				<?php foreach ( $admins as $admin ) : ?>
					<option value="<?php echo (int) $admin->ID; ?>" <?php selected( $user_id, $admin->ID ); ?>><?php echo esc_html( $admin->display_name . ' (' . $admin->user_login . ')' ); ?></option>
				<?php endforeach; ?>
			</select>
			<?php submit_button( 'Save', 'secondary', 'submit', false ); ?>
		</form>

		<form method="post" style="margin-top:1.5em" onsubmit="return confirm('The current URL will stop working. Continue?');">
			<?php wp_nonce_field( 'hdcc_settings' ); ?>
			<input type="hidden" name="hdcc_action" value="regenerate">
			<?php submit_button( 'Regenerate key (revoke access)', 'delete', 'submit', false ); ?>
		</form>
		<p class="description">To disconnect completely, deactivate this plugin.</p>
	</div>
	<?php
}

/* -------------------------------------------------------------------------
 * MCP endpoint (Streamable HTTP transport, JSON responses)
 * ---------------------------------------------------------------------- */

add_action( 'rest_api_init', function () {
	register_rest_route(
		HDCC_NAMESPACE,
		'/mcp/(?P<key>[A-Za-z0-9]{20,})',
		array(
			'methods'             => array( 'GET', 'POST', 'DELETE' ),
			'callback'            => 'hdcc_handle_request',
			'permission_callback' => 'hdcc_check_key',
		)
	);
} );

function hdcc_check_key( WP_REST_Request $request ) {
	$stored = (string) get_option( HDCC_OPT_KEY );
	if ( '' === $stored || ! hash_equals( $stored, (string) $request['key'] ) ) {
		return new WP_Error( 'hdcc_forbidden', 'Invalid connector key.', array( 'status' => 403 ) );
	}
	return true;
}

function hdcc_handle_request( WP_REST_Request $request ) {
	if ( 'POST' !== $request->get_method() ) {
		// No server-initiated SSE stream and no sessions to delete.
		return new WP_REST_Response( null, 405 );
	}

	$user_id = (int) get_option( HDCC_OPT_USER );
	if ( ! $user_id || ! user_can( $user_id, 'manage_options' ) ) {
		return new WP_REST_Response( hdcc_rpc_error( null, -32000, 'Connector user is not an administrator. Fix it in Settings → Claude Connector.' ), 500 );
	}
	wp_set_current_user( $user_id );

	$payload = json_decode( $request->get_body(), true );
	if ( null === $payload ) {
		return new WP_REST_Response( hdcc_rpc_error( null, -32700, 'Parse error' ), 400 );
	}

	$is_batch = is_array( $payload ) && isset( $payload[0] );
	$messages = $is_batch ? $payload : array( $payload );
	$replies  = array();

	foreach ( $messages as $message ) {
		$reply = hdcc_dispatch( $message );
		if ( null !== $reply ) {
			$replies[] = $reply;
		}
	}

	if ( ! $replies ) {
		// Only notifications / responses were sent.
		return new WP_REST_Response( null, 202 );
	}

	return new WP_REST_Response( $is_batch ? $replies : $replies[0], 200 );
}

function hdcc_rpc_error( $id, $code, $message ) {
	return array(
		'jsonrpc' => '2.0',
		'id'      => $id,
		'error'   => array( 'code' => $code, 'message' => $message ),
	);
}

function hdcc_rpc_result( $id, $result ) {
	return array( 'jsonrpc' => '2.0', 'id' => $id, 'result' => $result );
}

function hdcc_dispatch( $message ) {
	if ( ! is_array( $message ) || ! isset( $message['method'] ) ) {
		// A response from the client, or garbage — nothing to answer.
		return isset( $message['id'] ) && ! isset( $message['result'] ) && ! isset( $message['error'] )
			? hdcc_rpc_error( $message['id'], -32600, 'Invalid request' )
			: null;
	}

	$has_id = array_key_exists( 'id', $message );
	$id     = $has_id ? $message['id'] : null;
	$params = isset( $message['params'] ) && is_array( $message['params'] ) ? $message['params'] : array();

	switch ( $message['method'] ) {
		case 'initialize':
			$supported = array( '2025-06-18', '2025-03-26', '2024-11-05' );
			$requested = isset( $params['protocolVersion'] ) ? $params['protocolVersion'] : '';
			return hdcc_rpc_result( $id, array(
				'protocolVersion' => in_array( $requested, $supported, true ) ? $requested : $supported[0],
				'capabilities'    => array( 'tools' => new stdClass() ),
				'serverInfo'      => array( 'name' => 'hodigital-wp-' . sanitize_title( get_bloginfo( 'name' ) ), 'version' => HDCC_VERSION ),
				'instructions'    => 'WordPress site "' . get_bloginfo( 'name' ) . '" (' . home_url() . '). '
					. 'Always read content (get_content) before updating it, and confirm destructive actions with the user. '
					. 'Pages built with Elementor store their layout in _elementor_data, not post_content — check is_elementor in get_content.',
			) );

		case 'ping':
			return hdcc_rpc_result( $id, new stdClass() );

		case 'tools/list':
			return hdcc_rpc_result( $id, array( 'tools' => hdcc_tool_definitions() ) );

		case 'tools/call':
			$name = isset( $params['name'] ) ? (string) $params['name'] : '';
			$args = isset( $params['arguments'] ) && is_array( $params['arguments'] ) ? $params['arguments'] : array();
			return hdcc_rpc_result( $id, hdcc_call_tool( $name, $args ) );

		default:
			if ( ! $has_id ) {
				return null; // notifications/initialized, notifications/cancelled, ...
			}
			return hdcc_rpc_error( $id, -32601, 'Method not found: ' . $message['method'] );
	}
}

/* -------------------------------------------------------------------------
 * Tools
 * ---------------------------------------------------------------------- */

function hdcc_tool_definitions() {
	$obj = function ( $props, $required = array() ) {
		$schema = array( 'type' => 'object', 'properties' => $props ? $props : new stdClass() );
		if ( $required ) {
			$schema['required'] = $required;
		}
		return $schema;
	};
	$str  = function ( $d ) { return array( 'type' => 'string', 'description' => $d ); };
	$int  = function ( $d ) { return array( 'type' => 'integer', 'description' => $d ); };
	$bool = function ( $d ) { return array( 'type' => 'boolean', 'description' => $d ); };
	$strs = function ( $d ) { return array( 'type' => 'array', 'items' => array( 'type' => 'string' ), 'description' => $d ); };

	$content_fields = array(
		'title'          => $str( 'Title' ),
		'content'        => $str( 'Body HTML (Gutenberg block markup or plain HTML)' ),
		'excerpt'        => $str( 'Excerpt' ),
		'status'         => $str( 'publish | draft | pending | private | future' ),
		'slug'           => $str( 'URL slug' ),
		'parent_id'      => $int( 'Parent page ID' ),
		'menu_order'     => $int( 'Menu order' ),
		'date'           => $str( 'Publish date, e.g. 2026-10-01 09:00:00 (site timezone)' ),
		'categories'     => $strs( 'Category names (created if missing). Posts only.' ),
		'tags'           => $strs( 'Tag names (created if missing). Posts only.' ),
		'featured_media' => $int( 'Attachment ID to use as featured image (0 removes it)' ),
		'meta'           => array( 'type' => 'object', 'description' => 'Post meta to set, key → value (e.g. SEO fields, see update_post_meta)' ),
	);

	return array(
		array(
			'name'        => 'get_site_info',
			'description' => 'Site name, tagline, URL, WordPress version, theme, language, active plugins, available post types, and which SEO plugin is active.',
			'inputSchema' => $obj( array() ),
			'annotations' => array( 'readOnlyHint' => true ),
		),
		array(
			'name'        => 'list_content',
			'description' => 'List/search posts, pages or any custom post type.',
			'inputSchema' => $obj( array(
				'post_type' => $str( 'post (default), page, product, … or "any"' ),
				'search'    => $str( 'Free-text search' ),
				'status'    => $str( 'any (default), publish, draft, pending, private, future, trash' ),
				'per_page'  => $int( 'Default 20, max 100' ),
				'page'      => $int( 'Page number, default 1' ),
			) ),
			'annotations' => array( 'readOnlyHint' => true ),
		),
		array(
			'name'        => 'get_content',
			'description' => 'Get one post/page by ID or URL, including full content, meta (SEO fields) and whether it is built with Elementor.',
			'inputSchema' => $obj( array(
				'id'  => $int( 'Post ID' ),
				'url' => $str( 'Full URL of the page/post on this site (alternative to id)' ),
			) ),
			'annotations' => array( 'readOnlyHint' => true ),
		),
		array(
			'name'        => 'create_content',
			'description' => 'Create a post, page or custom post type item. Defaults to a draft.',
			'inputSchema' => $obj( array_merge( array( 'post_type' => $str( 'post (default), page, …' ) ), $content_fields ), array( 'title' ) ),
		),
		array(
			'name'        => 'update_content',
			'description' => 'Update fields of an existing post/page. Only the fields you pass are changed.',
			'inputSchema' => $obj( array_merge( array( 'id' => $int( 'Post ID' ) ), $content_fields ), array( 'id' ) ),
		),
		array(
			'name'        => 'delete_content',
			'description' => 'Move a post/page to the trash (or delete permanently with force=true).',
			'inputSchema' => $obj( array( 'id' => $int( 'Post ID' ), 'force' => $bool( 'Skip trash and delete permanently' ) ), array( 'id' ) ),
			'annotations' => array( 'destructiveHint' => true ),
		),
		array(
			'name'        => 'search_replace_text',
			'description' => 'Find & replace a string in post_content across the site (e.g. a phone number). Runs as a dry run unless dry_run=false. Does not touch Elementor data.',
			'inputSchema' => $obj( array(
				'find'       => $str( 'Exact text to find' ),
				'replace'    => $str( 'Replacement text' ),
				'post_types' => $strs( 'Limit to these post types (default: post, page)' ),
				'dry_run'    => $bool( 'Default true — only report what would change' ),
			), array( 'find', 'replace' ) ),
			'annotations' => array( 'destructiveHint' => true ),
		),
		array(
			'name'        => 'get_post_meta',
			'description' => 'Read post meta. Without key, returns all non-private meta plus known SEO fields.',
			'inputSchema' => $obj( array( 'id' => $int( 'Post ID' ), 'key' => $str( 'Meta key (optional)' ) ), array( 'id' ) ),
			'annotations' => array( 'readOnlyHint' => true ),
		),
		array(
			'name'        => 'update_post_meta',
			'description' => 'Set post meta values. SEO keys — Yoast: _yoast_wpseo_title, _yoast_wpseo_metadesc, _yoast_wpseo_focuskw. Rank Math: rank_math_title, rank_math_description, rank_math_focus_keyword. Pass null to delete a key.',
			'inputSchema' => $obj( array( 'id' => $int( 'Post ID' ), 'meta' => array( 'type' => 'object', 'description' => 'key → value' ) ), array( 'id', 'meta' ) ),
		),
		array(
			'name'        => 'list_media',
			'description' => 'List media library items.',
			'inputSchema' => $obj( array( 'search' => $str( 'Search' ), 'per_page' => $int( 'Default 20' ), 'page' => $int( 'Page' ) ) ),
			'annotations' => array( 'readOnlyHint' => true ),
		),
		array(
			'name'        => 'upload_media_from_url',
			'description' => 'Download an image/file from a public URL into the media library. Optionally set it as featured image of a post.',
			'inputSchema' => $obj( array(
				'url'             => $str( 'Public file URL' ),
				'title'           => $str( 'Title' ),
				'alt'             => $str( 'Alt text' ),
				'post_id'         => $int( 'Attach to this post' ),
				'set_as_featured' => $bool( 'Make it the featured image of post_id' ),
			), array( 'url' ) ),
		),
		array(
			'name'        => 'update_media',
			'description' => 'Update an attachment\'s title, alt text, caption or description.',
			'inputSchema' => $obj( array(
				'id'          => $int( 'Attachment ID' ),
				'title'       => $str( 'Title' ),
				'alt'         => $str( 'Alt text' ),
				'caption'     => $str( 'Caption' ),
				'description' => $str( 'Description' ),
			), array( 'id' ) ),
		),
		array(
			'name'        => 'list_terms',
			'description' => 'List categories, tags or any taxonomy terms.',
			'inputSchema' => $obj( array( 'taxonomy' => $str( 'category (default), post_tag, product_cat, …' ), 'search' => $str( 'Search' ) ) ),
			'annotations' => array( 'readOnlyHint' => true ),
		),
		array(
			'name'        => 'list_menus',
			'description' => 'List navigation menus with their items.',
			'inputSchema' => $obj( array() ),
			'annotations' => array( 'readOnlyHint' => true ),
		),
		array(
			'name'        => 'add_menu_item',
			'description' => 'Add a link to a navigation menu — either to a page/post (object_id) or a custom URL.',
			'inputSchema' => $obj( array(
				'menu_id'   => $int( 'Menu ID (from list_menus)' ),
				'title'     => $str( 'Link text' ),
				'object_id' => $int( 'Page/post ID to link to' ),
				'url'       => $str( 'Custom URL (if no object_id)' ),
				'parent_id' => $int( 'Parent menu item ID for a submenu' ),
			), array( 'menu_id' ) ),
		),
		array(
			'name'        => 'update_site_settings',
			'description' => 'Update site title and/or tagline.',
			'inputSchema' => $obj( array( 'title' => $str( 'Site title' ), 'tagline' => $str( 'Tagline' ) ) ),
		),
	);
}

function hdcc_call_tool( $name, $args ) {
	$fn = 'hdcc_tool_' . $name;
	$known = wp_list_pluck( hdcc_tool_definitions(), 'name' );
	if ( ! in_array( $name, $known, true ) || ! function_exists( $fn ) ) {
		return hdcc_tool_error( 'Unknown tool: ' . $name );
	}
	try {
		$result = call_user_func( $fn, $args );
	} catch ( Throwable $e ) {
		return hdcc_tool_error( $e->getMessage() );
	}
	if ( is_wp_error( $result ) ) {
		return hdcc_tool_error( $result->get_error_message() );
	}
	return array(
		'content' => array( array( 'type' => 'text', 'text' => wp_json_encode( $result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) ) ),
		'isError' => false,
	);
}

function hdcc_tool_error( $message ) {
	return array(
		'content' => array( array( 'type' => 'text', 'text' => $message ) ),
		'isError' => true,
	);
}

function hdcc_arg( $args, $key, $default = null ) {
	return array_key_exists( $key, $args ) ? $args[ $key ] : $default;
}

function hdcc_summarize_post( WP_Post $post ) {
	return array(
		'id'        => $post->ID,
		'type'      => $post->post_type,
		'status'    => $post->post_status,
		'title'     => get_the_title( $post ),
		'slug'      => urldecode( $post->post_name ),
		'url'       => urldecode( get_permalink( $post ) ),
		'date'      => $post->post_date,
		'modified'  => $post->post_modified,
		'parent_id' => $post->post_parent,
	);
}

function hdcc_seo_plugin() {
	if ( defined( 'WPSEO_VERSION' ) ) {
		return 'yoast';
	}
	if ( defined( 'RANK_MATH_VERSION' ) ) {
		return 'rank_math';
	}
	if ( defined( 'AIOSEO_VERSION' ) ) {
		return 'all_in_one_seo';
	}
	return null;
}

function hdcc_get_post_or_error( $id ) {
	$post = get_post( (int) $id );
	if ( ! $post ) {
		return new WP_Error( 'not_found', 'Post ' . (int) $id . ' not found.' );
	}
	return $post;
}

/* --- individual tools --------------------------------------------------- */

function hdcc_tool_get_site_info( $args ) {
	if ( ! function_exists( 'get_plugins' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	$active  = array();
	$plugins = get_plugins();
	foreach ( (array) get_option( 'active_plugins', array() ) as $file ) {
		$active[] = isset( $plugins[ $file ] ) ? $plugins[ $file ]['Name'] . ' ' . $plugins[ $file ]['Version'] : $file;
	}
	$theme = wp_get_theme();
	return array(
		'name'          => get_bloginfo( 'name' ),
		'tagline'       => get_bloginfo( 'description' ),
		'url'           => home_url(),
		'admin_email'   => get_option( 'admin_email' ),
		'language'      => get_locale(),
		'wp_version'    => get_bloginfo( 'version' ),
		'theme'         => $theme->get( 'Name' ) . ' ' . $theme->get( 'Version' ),
		'front_page_id' => (int) get_option( 'page_on_front' ),
		'seo_plugin'    => hdcc_seo_plugin(),
		'post_types'    => array_values( get_post_types( array( 'public' => true ) ) ),
		'active_plugins'=> $active,
	);
}

function hdcc_tool_list_content( $args ) {
	$per_page = min( 100, max( 1, (int) hdcc_arg( $args, 'per_page', 20 ) ) );
	$query    = new WP_Query( array(
		'post_type'      => hdcc_arg( $args, 'post_type', 'post' ),
		's'              => (string) hdcc_arg( $args, 'search', '' ),
		'post_status'    => hdcc_arg( $args, 'status', 'any' ),
		'posts_per_page' => $per_page,
		'paged'          => max( 1, (int) hdcc_arg( $args, 'page', 1 ) ),
		'orderby'        => 'modified',
		'order'          => 'DESC',
	) );
	return array(
		'total'       => (int) $query->found_posts,
		'total_pages' => (int) $query->max_num_pages,
		'items'       => array_map( 'hdcc_summarize_post', $query->posts ),
	);
}

function hdcc_tool_get_content( $args ) {
	$id = (int) hdcc_arg( $args, 'id', 0 );
	if ( ! $id && hdcc_arg( $args, 'url' ) ) {
		$id = url_to_postid( $args['url'] );
		if ( ! $id && untrailingslashit( $args['url'] ) === untrailingslashit( home_url() ) ) {
			$id = (int) get_option( 'page_on_front' );
		}
	}
	$post = hdcc_get_post_or_error( $id );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$data                  = hdcc_summarize_post( $post );
	$data['content']       = $post->post_content;
	$data['excerpt']       = $post->post_excerpt;
	$data['featured_media']= (int) get_post_thumbnail_id( $post );
	$data['is_elementor']  = 'builder' === get_post_meta( $post->ID, '_elementor_edit_mode', true );
	if ( 'post' === $post->post_type ) {
		$data['categories'] = wp_get_post_terms( $post->ID, 'category', array( 'fields' => 'names' ) );
		$data['tags']       = wp_get_post_terms( $post->ID, 'post_tag', array( 'fields' => 'names' ) );
	}
	$data['meta'] = hdcc_tool_get_post_meta( array( 'id' => $post->ID ) );
	return $data;
}

function hdcc_build_postarr( $args ) {
	$map = array(
		'title'      => 'post_title',
		'content'    => 'post_content',
		'excerpt'    => 'post_excerpt',
		'status'     => 'post_status',
		'slug'       => 'post_name',
		'parent_id'  => 'post_parent',
		'menu_order' => 'menu_order',
		'date'       => 'post_date',
	);
	$postarr = array();
	foreach ( $map as $in => $out ) {
		if ( array_key_exists( $in, $args ) ) {
			$postarr[ $out ] = $args[ $in ];
		}
	}
	return $postarr;
}

function hdcc_apply_extras( $post_id, $args ) {
	if ( isset( $args['categories'] ) && is_array( $args['categories'] ) ) {
		$ids = array();
		foreach ( $args['categories'] as $cat_name ) {
			$term = term_exists( $cat_name, 'category' );
			if ( ! $term ) {
				$term = wp_insert_term( $cat_name, 'category' );
			}
			if ( ! is_wp_error( $term ) ) {
				$ids[] = (int) $term['term_id'];
			}
		}
		wp_set_post_categories( $post_id, $ids );
	}
	if ( isset( $args['tags'] ) && is_array( $args['tags'] ) ) {
		wp_set_post_tags( $post_id, $args['tags'] );
	}
	if ( array_key_exists( 'featured_media', $args ) ) {
		$media_id = (int) $args['featured_media'];
		if ( $media_id ) {
			set_post_thumbnail( $post_id, $media_id );
		} else {
			delete_post_thumbnail( $post_id );
		}
	}
	if ( isset( $args['meta'] ) && is_array( $args['meta'] ) ) {
		hdcc_tool_update_post_meta( array( 'id' => $post_id, 'meta' => $args['meta'] ) );
	}
}

function hdcc_tool_create_content( $args ) {
	$postarr              = hdcc_build_postarr( $args );
	$postarr['post_type'] = hdcc_arg( $args, 'post_type', 'post' );
	if ( ! isset( $postarr['post_status'] ) ) {
		$postarr['post_status'] = 'draft';
	}
	$post_id = wp_insert_post( wp_slash( $postarr ), true );
	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}
	hdcc_apply_extras( $post_id, $args );
	return hdcc_summarize_post( get_post( $post_id ) );
}

function hdcc_tool_update_content( $args ) {
	$post = hdcc_get_post_or_error( hdcc_arg( $args, 'id' ) );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$postarr = hdcc_build_postarr( $args );
	if ( $postarr ) {
		$postarr['ID'] = $post->ID;
		$result        = wp_update_post( wp_slash( $postarr ), true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
	}
	hdcc_apply_extras( $post->ID, $args );
	return hdcc_summarize_post( get_post( $post->ID ) );
}

function hdcc_tool_delete_content( $args ) {
	$post = hdcc_get_post_or_error( hdcc_arg( $args, 'id' ) );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$force  = (bool) hdcc_arg( $args, 'force', false );
	$result = $force ? wp_delete_post( $post->ID, true ) : wp_trash_post( $post->ID );
	if ( ! $result ) {
		return new WP_Error( 'delete_failed', 'Could not delete post ' . $post->ID );
	}
	return array( 'id' => $post->ID, 'deleted' => $force, 'trashed' => ! $force );
}

function hdcc_tool_search_replace_text( $args ) {
	$find    = (string) hdcc_arg( $args, 'find', '' );
	$replace = (string) hdcc_arg( $args, 'replace', '' );
	$dry_run = false !== hdcc_arg( $args, 'dry_run', true );
	$types   = hdcc_arg( $args, 'post_types', array( 'post', 'page' ) );
	if ( '' === $find ) {
		return new WP_Error( 'bad_args', '"find" must not be empty.' );
	}

	global $wpdb;
	$types        = array_map( 'sanitize_key', (array) $types );
	$placeholders = implode( ',', array_fill( 0, count( $types ), '%s' ) );
	$like         = '%' . $wpdb->esc_like( $find ) . '%';
	// phpcs:ignore WordPress.DB.PreparedSQLPlaceholders
	$ids = $wpdb->get_col( $wpdb->prepare(
		"SELECT ID FROM {$wpdb->posts} WHERE post_type IN ($placeholders) AND post_status NOT IN ('trash','auto-draft','inherit') AND post_content LIKE %s",
		array_merge( $types, array( $like ) )
	) );

	$changed = array();
	foreach ( $ids as $id ) {
		$post  = get_post( $id );
		$count = substr_count( $post->post_content, $find );
		if ( ! $count ) {
			continue;
		}
		if ( ! $dry_run ) {
			wp_update_post( wp_slash( array(
				'ID'           => $post->ID,
				'post_content' => str_replace( $find, $replace, $post->post_content ),
			) ) );
		}
		$changed[] = array( 'id' => $post->ID, 'title' => get_the_title( $post ), 'occurrences' => $count );
	}
	return array( 'dry_run' => $dry_run, 'posts' => $changed );
}

function hdcc_tool_get_post_meta( $args ) {
	$post = hdcc_get_post_or_error( hdcc_arg( $args, 'id' ) );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$key = hdcc_arg( $args, 'key' );
	if ( $key ) {
		return array( $key => get_post_meta( $post->ID, $key, true ) );
	}
	$seo_keys = array(
		'_yoast_wpseo_title', '_yoast_wpseo_metadesc', '_yoast_wpseo_focuskw', '_yoast_wpseo_canonical',
		'rank_math_title', 'rank_math_description', 'rank_math_focus_keyword', 'rank_math_canonical_url',
	);
	$out = array();
	foreach ( get_post_meta( $post->ID ) as $meta_key => $values ) {
		if ( '' === $meta_key || '_' === $meta_key[0] && ! in_array( $meta_key, $seo_keys, true ) ) {
			continue;
		}
		$out[ $meta_key ] = maybe_unserialize( $values[0] );
	}
	return $out;
}

function hdcc_tool_update_post_meta( $args ) {
	$post = hdcc_get_post_or_error( hdcc_arg( $args, 'id' ) );
	if ( is_wp_error( $post ) ) {
		return $post;
	}
	$meta = hdcc_arg( $args, 'meta', array() );
	if ( ! is_array( $meta ) ) {
		return new WP_Error( 'bad_args', '"meta" must be an object.' );
	}
	foreach ( $meta as $key => $value ) {
		if ( null === $value ) {
			delete_post_meta( $post->ID, $key );
		} else {
			update_post_meta( $post->ID, $key, wp_slash( $value ) );
		}
	}
	return array( 'id' => $post->ID, 'updated' => array_keys( $meta ) );
}

function hdcc_summarize_media( WP_Post $att ) {
	return array(
		'id'    => $att->ID,
		'title' => get_the_title( $att ),
		'url'   => wp_get_attachment_url( $att->ID ),
		'alt'   => get_post_meta( $att->ID, '_wp_attachment_image_alt', true ),
		'mime'  => $att->post_mime_type,
		'date'  => $att->post_date,
	);
}

function hdcc_tool_list_media( $args ) {
	$query = new WP_Query( array(
		'post_type'      => 'attachment',
		'post_status'    => 'inherit',
		's'              => (string) hdcc_arg( $args, 'search', '' ),
		'posts_per_page' => min( 100, max( 1, (int) hdcc_arg( $args, 'per_page', 20 ) ) ),
		'paged'          => max( 1, (int) hdcc_arg( $args, 'page', 1 ) ),
	) );
	return array(
		'total' => (int) $query->found_posts,
		'items' => array_map( 'hdcc_summarize_media', $query->posts ),
	);
}

function hdcc_tool_upload_media_from_url( $args ) {
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$url = esc_url_raw( (string) hdcc_arg( $args, 'url', '' ) );
	if ( ! wp_http_validate_url( $url ) ) {
		return new WP_Error( 'bad_url', 'URL is not a valid public http(s) URL.' );
	}
	$tmp = download_url( $url, 60 );
	if ( is_wp_error( $tmp ) ) {
		return $tmp;
	}
	$filename = basename( (string) wp_parse_url( $url, PHP_URL_PATH ) );
	if ( '' === $filename || false === strpos( $filename, '.' ) ) {
		$filename = 'upload-' . time() . '.jpg';
	}
	$post_id = (int) hdcc_arg( $args, 'post_id', 0 );
	$att_id  = media_handle_sideload(
		array( 'name' => sanitize_file_name( $filename ), 'tmp_name' => $tmp ),
		$post_id,
		hdcc_arg( $args, 'title' )
	);
	if ( is_wp_error( $att_id ) ) {
		@unlink( $tmp ); // phpcs:ignore
		return $att_id;
	}
	if ( hdcc_arg( $args, 'alt' ) ) {
		update_post_meta( $att_id, '_wp_attachment_image_alt', sanitize_text_field( $args['alt'] ) );
	}
	if ( $post_id && hdcc_arg( $args, 'set_as_featured' ) ) {
		set_post_thumbnail( $post_id, $att_id );
	}
	return hdcc_summarize_media( get_post( $att_id ) );
}

function hdcc_tool_update_media( $args ) {
	$att = hdcc_get_post_or_error( hdcc_arg( $args, 'id' ) );
	if ( is_wp_error( $att ) ) {
		return $att;
	}
	if ( 'attachment' !== $att->post_type ) {
		return new WP_Error( 'bad_args', 'ID ' . $att->ID . ' is not an attachment.' );
	}
	$postarr = array( 'ID' => $att->ID );
	foreach ( array( 'title' => 'post_title', 'caption' => 'post_excerpt', 'description' => 'post_content' ) as $in => $out ) {
		if ( array_key_exists( $in, $args ) ) {
			$postarr[ $out ] = $args[ $in ];
		}
	}
	if ( count( $postarr ) > 1 ) {
		wp_update_post( wp_slash( $postarr ) );
	}
	if ( array_key_exists( 'alt', $args ) ) {
		update_post_meta( $att->ID, '_wp_attachment_image_alt', sanitize_text_field( $args['alt'] ) );
	}
	return hdcc_summarize_media( get_post( $att->ID ) );
}

function hdcc_tool_list_terms( $args ) {
	$terms = get_terms( array(
		'taxonomy'   => hdcc_arg( $args, 'taxonomy', 'category' ),
		'hide_empty' => false,
		'search'     => (string) hdcc_arg( $args, 'search', '' ),
		'number'     => 200,
	) );
	if ( is_wp_error( $terms ) ) {
		return $terms;
	}
	return array_map( function ( $t ) {
		return array( 'id' => $t->term_id, 'name' => $t->name, 'slug' => $t->slug, 'parent' => $t->parent, 'count' => $t->count );
	}, $terms );
}

function hdcc_tool_list_menus( $args ) {
	$locations = get_nav_menu_locations();
	$out       = array();
	foreach ( wp_get_nav_menus() as $menu ) {
		$items = wp_get_nav_menu_items( $menu->term_id );
		$out[] = array(
			'id'        => $menu->term_id,
			'name'      => $menu->name,
			'locations' => array_keys( $locations, $menu->term_id, true ),
			'items'     => array_map( function ( $i ) {
				return array( 'id' => $i->ID, 'title' => $i->title, 'url' => $i->url, 'parent_id' => (int) $i->menu_item_parent, 'object_id' => (int) $i->object_id );
			}, $items ? $items : array() ),
		);
	}
	return $out;
}

function hdcc_tool_add_menu_item( $args ) {
	$menu_id   = (int) hdcc_arg( $args, 'menu_id', 0 );
	$object_id = (int) hdcc_arg( $args, 'object_id', 0 );
	$data      = array(
		'menu-item-title'     => (string) hdcc_arg( $args, 'title', '' ),
		'menu-item-status'    => 'publish',
		'menu-item-parent-id' => (int) hdcc_arg( $args, 'parent_id', 0 ),
	);
	if ( $object_id ) {
		$target = hdcc_get_post_or_error( $object_id );
		if ( is_wp_error( $target ) ) {
			return $target;
		}
		$data['menu-item-type']      = 'post_type';
		$data['menu-item-object']    = $target->post_type;
		$data['menu-item-object-id'] = $object_id;
	} else {
		$data['menu-item-type'] = 'custom';
		$data['menu-item-url']  = esc_url_raw( (string) hdcc_arg( $args, 'url', '' ) );
	}
	$item_id = wp_update_nav_menu_item( $menu_id, 0, $data );
	if ( is_wp_error( $item_id ) ) {
		return $item_id;
	}
	return array( 'menu_id' => $menu_id, 'item_id' => $item_id );
}

function hdcc_tool_update_site_settings( $args ) {
	$updated = array();
	if ( array_key_exists( 'title', $args ) ) {
		update_option( 'blogname', sanitize_text_field( $args['title'] ) );
		$updated[] = 'title';
	}
	if ( array_key_exists( 'tagline', $args ) ) {
		update_option( 'blogdescription', sanitize_text_field( $args['tagline'] ) );
		$updated[] = 'tagline';
	}
	return array( 'updated' => $updated, 'title' => get_bloginfo( 'name' ), 'tagline' => get_bloginfo( 'description' ) );
}

<?php
/**
 * Plugin Name: PrivacyChecker Pro - GDPR Cookie Consent
 * Plugin URI: https://privacychecker.pro
 * Description: GDPR, CCPA, LGPD compliant cookie banner with geo-targeting consent management, script blocking, and Google Consent Mode v2.
 * Version: 1.0.0
 * Author: PrivacyChecker
 * Author URI: https://privacychecker.pro
 * License: GPL v2 or later
 * Text Domain: privacychecker
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('PRIVACYCHECKER_VERSION', '1.0.0');
define('PRIVACYCHECKER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PRIVACYCHECKER_PLUGIN_DIR', plugin_dir_path(__FILE__));

/**
 * Main PrivacyChecker Class
 */
class PrivacyChecker {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Admin hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
        
        // Frontend hooks
        add_action('wp_head', array($this, 'inject_banner_script'), 1);
        
        // Plugin activation/deactivation
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Add settings link on plugins page
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        $defaults = array(
            'site_id' => '',
            'enabled' => true,
            'color' => '2563eb',
            'position' => 'bottom',
            'privacy_url' => '/privacy-policy',
            'language' => 'auto',
            'geo_targeting' => true,
            'block_scripts' => true,
        );
        
        foreach ($defaults as $key => $value) {
            if (get_option('privacychecker_' . $key) === false) {
                add_option('privacychecker_' . $key, $value);
            }
        }
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Cleanup if needed
    }
    
    /**
     * Add settings link on plugins page
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="options-general.php?page=privacychecker">' . __('Settings', 'privacychecker') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('PrivacyChecker Settings', 'privacychecker'),
            __('PrivacyChecker', 'privacychecker'),
            'manage_options',
            'privacychecker',
            array($this, 'settings_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        // General settings
        register_setting('privacychecker_options', 'privacychecker_site_id', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        register_setting('privacychecker_options', 'privacychecker_enabled', array(
            'type' => 'boolean',
            'default' => true,
        ));
        register_setting('privacychecker_options', 'privacychecker_color', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_hex_color_no_hash',
        ));
        register_setting('privacychecker_options', 'privacychecker_position', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        register_setting('privacychecker_options', 'privacychecker_privacy_url', array(
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
        ));
        register_setting('privacychecker_options', 'privacychecker_language', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        register_setting('privacychecker_options', 'privacychecker_geo_targeting', array(
            'type' => 'boolean',
            'default' => true,
        ));
        register_setting('privacychecker_options', 'privacychecker_block_scripts', array(
            'type' => 'boolean',
            'default' => true,
        ));
    }
    
    /**
     * Admin scripts
     */
    public function admin_scripts($hook) {
        if ('settings_page_privacychecker' !== $hook) {
            return;
        }
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
    }
    
    /**
     * Settings page HTML
     */
    public function settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Save message
        if (isset($_GET['settings-updated'])) {
            add_settings_error('privacychecker_messages', 'privacychecker_message', 
                __('Settings saved successfully!', 'privacychecker'), 'updated');
        }
        
        settings_errors('privacychecker_messages');
        
        $site_id = get_option('privacychecker_site_id', '');
        $enabled = get_option('privacychecker_enabled', true);
        $color = get_option('privacychecker_color', '2563eb');
        $position = get_option('privacychecker_position', 'bottom');
        $privacy_url = get_option('privacychecker_privacy_url', '/privacy-policy');
        $language = get_option('privacychecker_language', 'auto');
        $geo_targeting = get_option('privacychecker_geo_targeting', true);
        $block_scripts = get_option('privacychecker_block_scripts', true);
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div style="display: flex; gap: 30px; margin-top: 20px;">
                <!-- Left column: Settings -->
                <div style="flex: 1; max-width: 600px;">
                    <form action="options.php" method="post">
                        <?php settings_fields('privacychecker_options'); ?>
                        
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="privacychecker_enabled"><?php _e('Enable Banner', 'privacychecker'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="privacychecker_enabled" name="privacychecker_enabled" value="1" <?php checked($enabled); ?>>
                                    <p class="description"><?php _e('Enable or disable the cookie consent banner on your site.', 'privacychecker'); ?></p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="privacychecker_site_id"><?php _e('Site ID', 'privacychecker'); ?></label>
                                </th>
                                <td>
                                    <input type="text" id="privacychecker_site_id" name="privacychecker_site_id" value="<?php echo esc_attr($site_id); ?>" class="regular-text" placeholder="your-site-id">
                                    <p class="description">
                                        <?php _e('Get your Site ID from', 'privacychecker'); ?> 
                                        <a href="https://privacychecker.pro/dashboard" target="_blank">privacychecker.pro/dashboard</a>
                                    </p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="privacychecker_color"><?php _e('Primary Color', 'privacychecker'); ?></label>
                                </th>
                                <td>
                                    <input type="text" id="privacychecker_color" name="privacychecker_color" value="#<?php echo esc_attr($color); ?>" class="color-picker">
                                    <p class="description"><?php _e('Color for buttons and accents.', 'privacychecker'); ?></p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="privacychecker_position"><?php _e('Banner Position', 'privacychecker'); ?></label>
                                </th>
                                <td>
                                    <select id="privacychecker_position" name="privacychecker_position">
                                        <option value="bottom" <?php selected($position, 'bottom'); ?>><?php _e('Bottom', 'privacychecker'); ?></option>
                                        <option value="top" <?php selected($position, 'top'); ?>><?php _e('Top', 'privacychecker'); ?></option>
                                    </select>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="privacychecker_privacy_url"><?php _e('Privacy Policy URL', 'privacychecker'); ?></label>
                                </th>
                                <td>
                                    <input type="text" id="privacychecker_privacy_url" name="privacychecker_privacy_url" value="<?php echo esc_attr($privacy_url); ?>" class="regular-text">
                                    <p class="description"><?php _e('Link to your privacy policy page.', 'privacychecker'); ?></p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="privacychecker_language"><?php _e('Language', 'privacychecker'); ?></label>
                                </th>
                                <td>
                                    <select id="privacychecker_language" name="privacychecker_language">
                                        <option value="auto" <?php selected($language, 'auto'); ?>><?php _e('Auto-detect (from visitor location)', 'privacychecker'); ?></option>
                                        <option value="en" <?php selected($language, 'en'); ?>>English</option>
                                        <option value="fr" <?php selected($language, 'fr'); ?>>Français</option>
                                        <option value="de" <?php selected($language, 'de'); ?>>Deutsch</option>
                                        <option value="es" <?php selected($language, 'es'); ?>>Español</option>
                                        <option value="it" <?php selected($language, 'it'); ?>>Italiano</option>
                                        <option value="pt" <?php selected($language, 'pt'); ?>>Português</option>
                                        <option value="nl" <?php selected($language, 'nl'); ?>>Nederlands</option>
                                        <option value="pl" <?php selected($language, 'pl'); ?>>Polski</option>
                                    </select>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="privacychecker_geo_targeting"><?php _e('Geo-Targeting', 'privacychecker'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="privacychecker_geo_targeting" name="privacychecker_geo_targeting" value="1" <?php checked($geo_targeting); ?>>
                                    <span><?php _e('Auto-detect visitor location for GDPR/CCPA/LGPD compliance', 'privacychecker'); ?></span>
                                    <p class="description"><?php _e('Shows appropriate consent mode based on visitor country.', 'privacychecker'); ?></p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="privacychecker_block_scripts"><?php _e('Block Scripts', 'privacychecker'); ?></label>
                                </th>
                                <td>
                                    <input type="checkbox" id="privacychecker_block_scripts" name="privacychecker_block_scripts" value="1" <?php checked($block_scripts); ?>>
                                    <span><?php _e('Block tracking scripts until consent is given', 'privacychecker'); ?></span>
                                    <p class="description"><?php _e('Blocks Google Analytics, Facebook Pixel, TikTok, etc. until user accepts.', 'privacychecker'); ?></p>
                                </td>
                            </tr>
                        </table>
                        
                        <?php submit_button(__('Save Settings', 'privacychecker')); ?>
                    </form>
                </div>
                
                <!-- Right column: Info -->
                <div style="flex: 0 0 300px;">
                    <div style="background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; padding: 20px;">
                        <h3 style="margin-top: 0;">🛡️ <?php _e('PrivacyChecker Pro', 'privacychecker'); ?></h3>
                        <p><?php _e('GDPR, CCPA, LGPD compliant cookie consent management.', 'privacychecker'); ?></p>
                        
                        <h4><?php _e('Features', 'privacychecker'); ?></h4>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li><?php _e('Geo-targeting (8 privacy laws)', 'privacychecker'); ?></li>
                            <li><?php _e('Auto-language detection', 'privacychecker'); ?></li>
                            <li><?php _e('Script blocking before consent', 'privacychecker'); ?></li>
                            <li><?php _e('Google Consent Mode v2', 'privacychecker'); ?></li>
                            <li><?php _e('Consent preferences modal', 'privacychecker'); ?></li>
                            <li><?php _e('Audit trail logging', 'privacychecker'); ?></li>
                        </ul>
                        
                        <h4><?php _e('Need Help?', 'privacychecker'); ?></h4>
                        <p>
                            <a href="https://privacychecker.pro/docs" target="_blank"><?php _e('Documentation', 'privacychecker'); ?></a><br>
                            <a href="mailto:support@privacychecker.pro"><?php _e('Contact Support', 'privacychecker'); ?></a>
                        </p>
                    </div>
                    
                    <?php if (empty($site_id)): ?>
                    <div style="background: #fff8e5; border: 1px solid #ffb900; border-radius: 4px; padding: 15px; margin-top: 20px;">
                        <strong>⚠️ <?php _e('Site ID Required', 'privacychecker'); ?></strong>
                        <p style="margin-bottom: 0;"><?php _e('Please enter your Site ID to activate the banner.', 'privacychecker'); ?></p>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('.color-picker').wpColorPicker({
                change: function(event, ui) {
                    $(this).val(ui.color.toString().replace('#', ''));
                }
            });
        });
        </script>
        <?php
    }
    
    /**
     * Inject banner script in frontend
     */
    public function inject_banner_script() {
        // Check if enabled
        if (!get_option('privacychecker_enabled', true)) {
            return;
        }
        
        // Don't show in admin or for logged-in admins (optional)
        if (is_admin()) {
            return;
        }
        
        $site_id = get_option('privacychecker_site_id', '');
        
        // Site ID is required
        if (empty($site_id)) {
            return;
        }
        
        // Build script URL with options
        $params = array(
            'id' => $site_id,
            'color' => get_option('privacychecker_color', '2563eb'),
            'position' => get_option('privacychecker_position', 'bottom'),
            'privacy' => get_option('privacychecker_privacy_url', '/privacy-policy'),
            'lang' => get_option('privacychecker_language', 'auto'),
        );
        
        // Geo-targeting
        if (!get_option('privacychecker_geo_targeting', true)) {
            $params['geo'] = 'false';
        }
        
        $script_url = 'https://privacychecker.pro/api/banner?' . http_build_query($params);
        
        // Output script tag
        echo '<script src="' . esc_url($script_url) . '" defer></script>' . "\n";
    }
}

/**
 * Sanitize hex color without hash
 */
function sanitize_hex_color_no_hash($color) {
    $color = ltrim($color, '#');
    if (preg_match('/^[a-fA-F0-9]{6}$/', $color)) {
        return $color;
    }
    return '2563eb'; // Default blue
}

// Initialize plugin
PrivacyChecker::get_instance();

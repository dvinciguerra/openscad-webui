require 'sinatra'
require 'sinatra/json'

require 'sinatra/reloader' if development?

set :public_folder, File.dirname(__FILE__) + '/public'
set :views, File.dirname(__FILE__) + '/views'
set :static, true
# set :static_cache_control, [:public, max_age: 60 * 60 * 24 * 365]
# set :port, 4567
# set :bind, '0.0.0.0'
set :environment, :production
set :logging, true
# set :protection, except: :frame_options
set :reload_templates, true if development?
set :server, :webrick

# app helpers
helpers do
  def partial(template, **options)
    options = { layout: false }.merge(**options)
    erb(template.to_sym, **options)
  end
end

get '/' do
  erb :'home/index'
end


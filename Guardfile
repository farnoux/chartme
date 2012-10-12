guard 'shell' do
	watch /src\/(.*).(js|css)/ do |m|
		file = m[0]

		# Build
		`make`

		# Notify
		n "#{file} has changed. Rebuilt.", 'chartme', :success
	end
end
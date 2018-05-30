module Gitlab
  module GrapeLogging
    module Formatters
      class LogrageWithTimestamp
        include Gitlab::EncodingHelper

        def call(severity, datetime, _, data)
          time = data.delete :time
          utf8_encode_values(data[:params]) if data.has_key?(:params)

          attributes = {
            time: datetime.utc.iso8601(3),
            severity: severity,
            duration: time[:total],
            db: time[:db],
            view: time[:view]
          }.merge(data)
          ::Lograge.formatter.call(attributes) + "\n"
        end

        private

        def utf8_encode_values(data)
          case data
          when Hash
            data.values.each { |v| utf8_encode_values(v) }
          when Array
            data.each { |v| utf8_encode_values(v) }
          when String
            encode_utf8 data
          end
        end
      end
    end
  end
end

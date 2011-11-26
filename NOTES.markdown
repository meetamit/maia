## Mongo DB
If this is your first install, automatically load on login with:
    mkdir -p ~/Library/LaunchAgents
    cp /usr/local/Cellar/mongodb/2.0.1-x86_64/org.mongodb.mongod.plist ~/Library/LaunchAgents/
    launchctl load -w ~/Library/LaunchAgents/org.mongodb.mongod.plist

If this is an upgrade and you already have the org.mongodb.mongod.plist loaded:
    launchctl unload -w ~/Library/LaunchAgents/org.mongodb.mongod.plist
    cp /usr/local/Cellar/mongodb/2.0.1-x86_64/org.mongodb.mongod.plist ~/Library/LaunchAgents/
    launchctl load -w ~/Library/LaunchAgents/org.mongodb.mongod.plist

Or start it manually:
    mongod run --config /usr/local/Cellar/mongodb/2.0.1-x86_64/mongod.conf
MongoDB 1.8+ includes a feature for Write Ahead Logging (Journaling), which has been enabled by default.
To disable journaling, use --nojournal.

* * * *

## Testing
Url param "stub_now=1321038671000" will stub to 11:11:11
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var url = require('url');

var urls = [];

module.exports = {
  // Map of hooks
  hooks: {
    "page": function (page) {
      if (this.output.name != 'website') return page;

      var lang = this.config.get('language', '');
      var outputDir = this.config.get('output');
      var outputUrl = this.output.toURL(path.resolve(outputDir, lang, page.path));

      if (page.path === 'README.md') {
        outputUrl = path.join(outputUrl, 'index.html');
      }

      urls.push({
        url: outputUrl
      });

      return page;
    },

    "finish": function() {
      var $, $el, html;
      var templatePath = this.config.get('pluginsConfig.components.templatePath');
      var templates = this.config.get('pluginsConfig.components.templates');
      templatePath = templatePath || 'docs/components';

      urls.forEach(item => {
        html = fs.readFileSync(item.url, {encoding: 'utf-8'});
        $ = cheerio.load(html);

        templates.forEach(template => {
          var singleTemplatePath = this.resolve(templatePath + '/' + template.name + '.html');
          if (singleTemplatePath && fs.existsSync(singleTemplatePath)) {
            var templateHTML = (fs.readFileSync(singleTemplatePath, {encoding: 'utf-8'}));
            $el = $(template.target);
            if (template.prepend !== "false") {
              $el.prepend(templateHTML);
            } else {
              $el.append(templateHTML);
            }
          }
        });

        fs.writeFileSync(item.url, $.root().html(), {encoding: 'utf-8'});
      })
    }
  }
};

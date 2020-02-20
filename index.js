const fs = require('fs')

/**
 * Resolve files in custom directories
 *
 * @param {Object} config
 * @constructor
 */
function CustomPathResolver(config)
{
	const {
			  customizationDir,
			  sourceDir,
			  excludePath,
			  excludeRequest,
			  jsCompleteFileName,
			  jsFileExtension,
		  }                 = config
	this.customizationDir   = customizationDir
	this.sourceDir          = sourceDir
	this.excludePath        = excludePath || /(node_modules|projects)/
	this.excludeRequest     = excludeRequest || 'node_modules'
	this.jsCompleteFileName = jsCompleteFileName || 'index'
	this.jsFileExtension    = jsFileExtension || 'js'
	this.listExtensions     = ['js', 'jsx', 'css', 'scss', 'gif', 'png', 'jpg', 'jpeg', 'svg', 'woff', 'woff2', 'otf',
		'ttf', 'json', 'sass', 'ts']
}

/**
 * Find fie in custom directory
 *
 * @param {string} file
 * @param {function} successCallback
 * @param {function} failCallback
 *
 * @return {undefined}
 */
const findFile     = (file, successCallback, failCallback) => {
	fs.stat(file, (err, stat) => {
		if (!err && stat && stat.isFile()) {
			return successCallback()
		}

		return failCallback()
	})
}

/**
 * Custom path resover module
 *
 * @param {Object} resolver
 *
 * @return {undefined}
 */
CustomPathResolver.prototype.apply = function(resolver) {
	const {
			  customizationDir,
			  sourceDir,
			  excludePath,
			  excludeRequest,
			  jsCompleteFileName,
			  jsFileExtension,
			  listExtensions,
		  } = this

	resolver.hooks.resolve.tapAsync('CustomPathResolver', (request, resolveContext, finalCallback) => {
		if (
			(!request.request || !request.path) ||
			(!request.request.startsWith('./') && !request.request.startsWith('../')) ||
			request.path.match(excludePath) ||
			request.request.match(excludeRequest) ||
			(
				request.context.issuer &&
				(request.context.issuer.match(excludePath) || !request.context.issuer.match(`.${jsFileExtension}`))
			)
		) {
			return finalCallback()
		}

		const clearRequest = request.request.replace('../', '/').replace('./', '/')
		const extension    = clearRequest.match(/(?:\.([^.]+))?$/)[1]
		const newFilePath  = `${customizationDir}${clearRequest}`.replace(`.${extension}`, '')
		const resolvePath  = request.path.replace(sourceDir, customizationDir)

		const successCallback = () => {
			const result = {
				...request, ...{
					path: resolvePath,
				},
			}

			// console.log(`-----------------------`)
			// console.log(`ISSUER: ${request.context.issuer}`)
			// console.log(`FOR: ${request.request}`)
			// console.log(`BEFORE PATH: ${request.path}`)
			// console.log(`NEW PATH: ${result.path}   ------`)
			// console.log(`-----------------------`)

			return resolver.doResolve(resolver.hooks.resolve, result, `resolve`, resolveContext, finalCallback)
		}

		return findFile(`${newFilePath}.${extension || jsFileExtension}`, successCallback, () => {
			if (extension && listExtensions.indexOf(extension.toLowerCase()) !== -1) {
				return finalCallback()
			}

			findFile(`${resolvePath}${clearRequest}.${jsFileExtension}`, successCallback, () => {
				findFile(`${newFilePath}/${jsCompleteFileName}.${jsFileExtension}`, successCallback, () => {
					const oneModule = `${resolvePath}${clearRequest}/${jsCompleteFileName}.${jsFileExtension}`

					findFile(oneModule, successCallback, () => {
						return finalCallback()
					})
				})
			})

			return null
		})
	})
}

exports.CustomPathResolver = CustomPathResolver
module.exports             = CustomPathResolver

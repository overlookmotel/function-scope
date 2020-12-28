#include <node.h>

namespace demo {

using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::HandleScope;
using v8::Integer;
using v8::Isolate;
using v8::Local;
using v8::Object;
// using v8::SharedFunctionInfo;
using v8::ScriptOrigin;
using v8::String;
using v8::Value;

void Method(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();
	HandleScope scope(isolate);
	Local<Context> context = isolate->GetCurrentContext();

	Local<Function> fn = Local<Function>::Cast(args[0]);
	// SharedFunctionInfo* shared = fn->shared();

	// Create return value object
	Local<Object> ret = Object::New(isolate);
	args.GetReturnValue().Set(ret);

	// Get line and column
	unsigned lineNum = fn->GetScriptLineNumber();
	ret->Set(
		context,
		String::NewFromUtf8(isolate, "line").ToLocalChecked(),
		Integer::NewFromUnsigned(isolate, lineNum)
	).FromJust();

	unsigned colNum = fn->GetScriptColumnNumber();
	ret->Set(
		context,
		String::NewFromUtf8(isolate, "column").ToLocalChecked(),
		Integer::NewFromUnsigned(isolate, colNum)
	).FromJust();

	// Get file path
	ScriptOrigin origin = fn->GetScriptOrigin();
	Local<Value> path = origin.ResourceName();
	ret->Set(
		context,
		String::NewFromUtf8(isolate, "path").ToLocalChecked(),
		path
	).FromJust();

	// Get script ID
	unsigned scriptId = fn->ScriptId();
	ret->Set(
		context,
		String::NewFromUtf8(isolate, "scriptId").ToLocalChecked(),
		Integer::NewFromUnsigned(isolate, scriptId)
	).FromJust();
}

void Init(Local<Object> exports, Local<Object> module) {
	NODE_SET_METHOD(module, "exports", Method);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)

}	// namespace demo
